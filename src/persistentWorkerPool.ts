/**
 * Persistent Worker Pool
 *
 * Manages a pool of long-lived workers that process mutations sequentially.
 * This eliminates the overhead of spawning a new worker for each mutation.
 *
 * Architecture:
 * - Workers stay alive for the entire mutation testing session
 * - Each worker processes mutations one at a time
 * - Workers are reused across multiple mutations
 * - Failed workers are automatically replaced
 */

import { MutationRun } from "./mutasaurus.ts";
import { TestResult } from "./testRunner.ts";

export interface WorkerTask {
  mutation: MutationRun;
  sourceFiles: Array<{
    path: string;
    relativePath: string;
    content: string;
  }>;
  testFiles: Array<{
    path: string;
    relativePath: string;
    content: string;
  }>;
  workingDirectory: string;
  noCheck: boolean;
}

export interface WorkerMessage {
  type: "execute" | "shutdown";
  taskId: string;
  task?: WorkerTask;
}

export interface WorkerResponse {
  type: "ready" | "result" | "error";
  taskId?: string;
  result?: TestResult;
  error?: string;
}

interface PendingTask {
  taskId: string;
  task: WorkerTask;
  resolve: (result: TestResult) => void;
  reject: (error: Error) => void;
  timeout: number;
  timeoutId?: number;
}

interface WorkerInfo {
  worker: Worker;
  workerId: string;
  isIdle: boolean;
  currentTask: PendingTask | null;
  tasksCompleted: number;
  lastActivity: number;
  restartCount: number;
}

export class PersistentWorkerPool {
  private workers: WorkerInfo[] = [];
  private taskQueue: PendingTask[] = [];
  private maxWorkers: number;
  private timeout: number;
  private debug: boolean;
  private isShuttingDown: boolean = false;
  private taskIdCounter: number = 0;

  // Worker lifecycle management
  private maxTasksPerWorker: number = 100; // Restart workers after N tasks to prevent memory leaks
  private workerHealthCheckInterval: number = 30000; // Check worker health every 30s
  private healthCheckTimer: number | null = null;

  constructor(
    maxWorkers: number = 8,
    timeout: number = 10000,
    debug: boolean = false,
  ) {
    this.maxWorkers = maxWorkers;
    this.timeout = timeout;
    this.debug = debug;
  }

  /**
   * Initialize the worker pool
   */
  async initialize(): Promise<void> {
    if (this.debug) {
      console.log(
        `Initializing persistent worker pool with ${this.maxWorkers} workers...`,
      );
    }

    for (let i = 0; i < this.maxWorkers; i++) {
      await this.createWorker();
    }

    // Start health check timer
    this.healthCheckTimer = setInterval(() => {
      this.checkWorkerHealth();
    }, this.workerHealthCheckInterval);

    if (this.debug) {
      console.log(
        `Worker pool initialized with ${this.workers.length} workers`,
      );
    }
  }

  /**
   * Create a new worker and add it to the pool
   */
  private async createWorker(): Promise<WorkerInfo> {
    const workerId = `worker-${Date.now()}-${
      Math.random().toString(36).substring(7)
    }`;

    const worker = new Worker(
      new URL("./persistentWorker.ts", import.meta.url).href,
      {
        type: "module",
        name: workerId,
      },
    );

    const workerInfo: WorkerInfo = {
      worker,
      workerId,
      isIdle: false, // Will become true when worker sends "ready"
      currentTask: null,
      tasksCompleted: 0,
      lastActivity: Date.now(),
      restartCount: 0,
    };

    // Set up worker message handler
    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      this.handleWorkerMessage(workerInfo, e.data);
    };

    // Set up worker error handler
    worker.onerror = (error: ErrorEvent) => {
      this.handleWorkerError(workerInfo, error);
    };

    this.workers.push(workerInfo);

    // Wait for worker to become ready
    await new Promise<void>((resolve) => {
      const checkReady = () => {
        if (workerInfo.isIdle) {
          resolve();
        } else {
          setTimeout(checkReady, 10);
        }
      };
      checkReady();
    });

    return workerInfo;
  }

  /**
   * Handle messages from workers
   */
  private handleWorkerMessage(
    workerInfo: WorkerInfo,
    message: WorkerResponse,
  ): void {
    workerInfo.lastActivity = Date.now();

    switch (message.type) {
      case "ready":
        if (this.debug) {
          console.log(`Worker ${workerInfo.workerId} is ready`);
        }
        workerInfo.isIdle = true;
        this.processQueue();
        break;

      case "result":
        if (message.taskId && message.result) {
          const task = workerInfo.currentTask;
          if (task && task.taskId === message.taskId) {
            // Clear timeout
            if (task.timeoutId) {
              clearTimeout(task.timeoutId);
            }

            // Resolve the task
            task.resolve(message.result);

            // Update worker state
            workerInfo.tasksCompleted++;
            workerInfo.currentTask = null;
            workerInfo.isIdle = true;

            // Check if worker needs restart due to task limit
            if (workerInfo.tasksCompleted >= this.maxTasksPerWorker) {
              if (this.debug) {
                console.log(
                  `Worker ${workerInfo.workerId} reached task limit, restarting...`,
                );
              }
              this.restartWorker(workerInfo);
            } else {
              // Process next task
              this.processQueue();
            }
          }
        }
        break;

      case "error":
        if (message.taskId) {
          const task = workerInfo.currentTask;
          if (task && task.taskId === message.taskId) {
            // Clear timeout
            if (task.timeoutId) {
              clearTimeout(task.timeoutId);
            }

            // Reject the task
            task.reject(new Error(message.error || "Worker error"));

            // Reset worker state and restart it
            workerInfo.currentTask = null;
            workerInfo.isIdle = false;
            this.restartWorker(workerInfo);
          }
        }
        break;
    }
  }

  /**
   * Handle worker errors
   */
  private handleWorkerError(workerInfo: WorkerInfo, error: ErrorEvent): void {
    console.error(`Worker ${workerInfo.workerId} error:`, error.message);

    // If there's a current task, reject it
    if (workerInfo.currentTask) {
      if (workerInfo.currentTask.timeoutId) {
        clearTimeout(workerInfo.currentTask.timeoutId);
      }
      workerInfo.currentTask.reject(
        new Error(`Worker crashed: ${error.message}`),
      );
      workerInfo.currentTask = null;
    }

    // Restart the worker
    workerInfo.isIdle = false;
    this.restartWorker(workerInfo);
  }

  /**
   * Restart a worker
   */
  private async restartWorker(workerInfo: WorkerInfo): Promise<void> {
    if (this.debug) {
      console.log(`Restarting worker ${workerInfo.workerId}...`);
    }

    // Terminate old worker
    try {
      workerInfo.worker.terminate();
    } catch (_error) {
      // Ignore termination errors
    }

    // Remove from pool
    const index = this.workers.indexOf(workerInfo);
    if (index > -1) {
      this.workers.splice(index, 1);
    }

    // Create new worker
    const newWorker = await this.createWorker();
    newWorker.restartCount = workerInfo.restartCount + 1;

    if (this.debug) {
      console.log(
        `Worker restarted (restart count: ${newWorker.restartCount})`,
      );
    }

    // Process queue with new worker
    this.processQueue();
  }

  /**
   * Check health of all workers
   */
  private checkWorkerHealth(): void {
    const now = Date.now();
    const maxIdleTime = 120000; // 2 minutes

    for (const workerInfo of this.workers) {
      // Check for stuck workers
      if (workerInfo.currentTask) {
        const taskRuntime = now - workerInfo.lastActivity;
        // Workers with active tasks should be making progress
        // If no activity for longer than 2x timeout, consider it stuck
        if (taskRuntime > workerInfo.currentTask.timeout * 2) {
          console.warn(
            `Worker ${workerInfo.workerId} appears stuck, restarting...`,
          );

          // Reject the current task
          if (workerInfo.currentTask.timeoutId) {
            clearTimeout(workerInfo.currentTask.timeoutId);
          }
          workerInfo.currentTask.reject(new Error("Worker stuck"));
          workerInfo.currentTask = null;

          this.restartWorker(workerInfo);
        }
      } else if (workerInfo.isIdle) {
        // Check for idle workers that haven't responded in a while
        const idleTime = now - workerInfo.lastActivity;
        if (idleTime > maxIdleTime) {
          if (this.debug) {
            console.log(
              `Worker ${workerInfo.workerId} idle for ${idleTime}ms, restarting...`,
            );
          }
          this.restartWorker(workerInfo);
        }
      }
    }
  }

  /**
   * Execute a task using the worker pool
   */
  executeTask(task: WorkerTask, timeout?: number): Promise<TestResult> {
    if (this.isShuttingDown) {
      throw new Error("Worker pool is shutting down");
    }

    const taskId = `task-${this.taskIdCounter++}`;
    const effectiveTimeout = timeout || this.timeout;

    return new Promise<TestResult>((resolve, reject) => {
      const pendingTask: PendingTask = {
        taskId,
        task,
        resolve,
        reject,
        timeout: effectiveTimeout,
      };

      this.taskQueue.push(pendingTask);
      this.processQueue();
    });
  }

  /**
   * Process the task queue
   */
  private processQueue(): void {
    if (this.isShuttingDown) {
      return;
    }

    // Find idle workers
    const idleWorkers = this.workers.filter((w) => w.isIdle);

    // Process tasks while we have idle workers and queued tasks
    while (idleWorkers.length > 0 && this.taskQueue.length > 0) {
      const worker = idleWorkers.shift();
      const pendingTask = this.taskQueue.shift();

      if (worker && pendingTask) {
        this.assignTaskToWorker(worker, pendingTask);
      }
    }
  }

  /**
   * Assign a task to a specific worker
   */
  private assignTaskToWorker(
    workerInfo: WorkerInfo,
    pendingTask: PendingTask,
  ): void {
    workerInfo.isIdle = false;
    workerInfo.currentTask = pendingTask;
    workerInfo.lastActivity = Date.now();

    // Set up timeout
    pendingTask.timeoutId = setTimeout(() => {
      if (workerInfo.currentTask === pendingTask) {
        // Task timed out
        const timedOutResult: TestResult = {
          mutation: {
            ...pendingTask.task.mutation,
            status: "timed-out",
            duration: pendingTask.timeout,
          },
          outcome: "timed-out",
          duration: pendingTask.timeout,
        };

        pendingTask.resolve(timedOutResult);
        workerInfo.currentTask = null;

        // Restart the worker as it may be stuck
        if (this.debug) {
          console.log(
            `Task ${pendingTask.taskId} timed out, restarting worker...`,
          );
        }
        this.restartWorker(workerInfo);
      }
    }, pendingTask.timeout);

    // Send task to worker
    const message: WorkerMessage = {
      type: "execute",
      taskId: pendingTask.taskId,
      task: pendingTask.task,
    };

    try {
      workerInfo.worker.postMessage(message);
    } catch (_error) {
      // Failed to send message, restart worker
      if (pendingTask.timeoutId) {
        clearTimeout(pendingTask.timeoutId);
      }
      pendingTask.reject(new Error("Failed to send task to worker"));
      workerInfo.currentTask = null;
      this.restartWorker(workerInfo);
    }
  }

  /**
   * Get pool status
   */
  getStatus(): {
    totalWorkers: number;
    idleWorkers: number;
    activeWorkers: number;
    queuedTasks: number;
    tasksCompleted: number;
  } {
    const idleWorkers = this.workers.filter((w) => w.isIdle).length;
    const tasksCompleted = this.workers.reduce(
      (sum, w) => sum + w.tasksCompleted,
      0,
    );

    return {
      totalWorkers: this.workers.length,
      idleWorkers,
      activeWorkers: this.workers.length - idleWorkers,
      queuedTasks: this.taskQueue.length,
      tasksCompleted,
    };
  }

  /**
   * Shutdown the worker pool
   */
  async shutdown(): Promise<void> {
    if (this.isShuttingDown) {
      return;
    }

    this.isShuttingDown = true;

    if (this.debug) {
      console.log("Shutting down worker pool...");
    }

    // Stop health check
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }

    // Send shutdown message to all workers
    for (const workerInfo of this.workers) {
      try {
        const message: WorkerMessage = {
          type: "shutdown",
          taskId: "shutdown",
        };
        workerInfo.worker.postMessage(message);
      } catch (_error) {
        // Ignore errors
      }
    }

    // Wait a bit for graceful shutdown
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Terminate all workers
    for (const workerInfo of this.workers) {
      try {
        workerInfo.worker.terminate();
      } catch (_error) {
        // Ignore termination errors
      }
    }

    this.workers = [];

    if (this.debug) {
      console.log("Worker pool shut down");
    }
  }
}
