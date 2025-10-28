// memoryMonitor.ts - Advanced Memory Monitoring System for Deno Workers

import { Logger } from "./logger.ts";

/**
 * Configuration options for the MemoryMonitor
 */
interface MemoryMonitorOptions {
  // Memory thresholds in MB
  warningThresholdMB: number;
  criticalThresholdMB: number;
  emergencyThresholdMB: number;

  // Monitoring interval in ms
  monitorIntervalMs: number;

  // Maximum number of samples to keep for trend analysis
  maxSampleHistory: number;

  // Action callbacks
  onWarning?: (usage: MemoryUsage) => void;
  onCritical?: (usage: MemoryUsage) => void;
  onEmergency?: (usage: MemoryUsage) => void;

  // Recovery options
  recoveryCheckIntervalMs: number;
  recoveryThresholdMB: number;

  // Logging options
  logToConsole: boolean;
  logToFile: boolean;
  logFilePath?: string;
}

/**
 * Memory usage information
 */
interface MemoryUsage {
  timestamp: number;
  rss: number; // Resident Set Size in bytes
  heapTotal: number;
  heapUsed: number;
  external: number;
  rssMB: number; // RSS in megabytes for convenience
  trend: "increasing" | "decreasing" | "stable" | "unknown";
  growthRate: number; // MB per minute
}

/**
 * Alert level enum
 */
enum AlertLevel {
  NORMAL = "NORMAL",
  WARNING = "WARNING",
  CRITICAL = "CRITICAL",
  EMERGENCY = "EMERGENCY",
}

/**
 * Advanced memory monitoring system
 */
class MemoryMonitor {
  private options: MemoryMonitorOptions;
  private memoryHistory: MemoryUsage[] = [];
  private currentAlertLevel: AlertLevel = AlertLevel.NORMAL;
  private monitorIntervalId: number | null = null;
  private paused = false;
  private throttlingFactor = 1;
  private logHistory: string[] = [];

  constructor(options?: Partial<MemoryMonitorOptions>) {
    // Default options
    this.options = {
      warningThresholdMB: 500,
      criticalThresholdMB: 800,
      emergencyThresholdMB: 1200,
      monitorIntervalMs: 5000,
      maxSampleHistory: 20,
      recoveryCheckIntervalMs: 10000,
      recoveryThresholdMB: 450,
      logToConsole: true,
      logToFile: false,
      ...options,
    };
  }

  /**
   * Start monitoring memory usage
   */
  start(): void {
    if (this.monitorIntervalId !== null) {
      this.log("Monitor already running", "INFO");
      return;
    }

    this.log("Starting memory monitor", "INFO");
    this.monitorIntervalId = setInterval(() => {
      if (!this.paused) {
        this.checkMemory();
      }
    }, this.options.monitorIntervalMs);
  }

  /**
   * Stop monitoring memory usage
   */
  stop(): void {
    if (this.monitorIntervalId !== null) {
      clearInterval(this.monitorIntervalId);
      this.monitorIntervalId = null;
      this.log("Memory monitor stopped", "INFO");
    }
  }

  /**
   * Pause monitoring temporarily
   */
  pause(): void {
    this.paused = true;
    this.log("Memory monitor paused", "INFO");
  }

  /**
   * Resume monitoring after pause
   */
  resume(): void {
    this.paused = false;
    this.log("Memory monitor resumed", "INFO");
  }

  /**
   * Get current memory throttling factor (useful for worker pools to adjust)
   * Returns a value between 0 and 1, where lower values indicate more throttling needed
   */
  getThrottlingFactor(): number {
    return this.throttlingFactor;
  }

  /**
   * Check current memory usage and take appropriate action
   */
  private checkMemory(): void {
    const rawMemoryInfo = Deno.memoryUsage();
    const currentTime = Date.now();

    const memoryUsage: MemoryUsage = {
      timestamp: currentTime,
      rss: rawMemoryInfo.rss,
      heapTotal: rawMemoryInfo.heapTotal,
      heapUsed: rawMemoryInfo.heapUsed,
      external: rawMemoryInfo.external,
      rssMB: Math.round(rawMemoryInfo.rss / 1024 / 1024),
      trend: "unknown",
      growthRate: 0,
    };

    // Calculate trend and growth rate if we have history
    if (this.memoryHistory.length > 2) {
      const oldestSample = this.memoryHistory[0];
      const previousSample = this.memoryHistory[this.memoryHistory.length - 1];

      if (oldestSample !== undefined && previousSample !== undefined) {
        // Calculate short-term trend
        if (memoryUsage.rssMB > previousSample.rssMB + 5) {
          memoryUsage.trend = "increasing";
        } else if (memoryUsage.rssMB < previousSample.rssMB - 5) {
          memoryUsage.trend = "decreasing";
        } else {
          memoryUsage.trend = "stable";
        }

        // Calculate growth rate (MB per minute)
        const minutesPassed = (currentTime - oldestSample.timestamp) / 60000;
        if (minutesPassed > 0) {
          memoryUsage.growthRate = (memoryUsage.rssMB - oldestSample.rssMB) /
            minutesPassed;
        }
      }
    }

    // Add to history and trim if needed
    this.memoryHistory.push(memoryUsage);
    if (this.memoryHistory.length > this.options.maxSampleHistory) {
      this.memoryHistory.shift();
    }

    // Update throttling factor based on memory usage
    this.updateThrottlingFactor(memoryUsage);

    // Check against thresholds and take action
    this.checkThresholds(memoryUsage);

    // Log regular stats if appropriate
    if (
      this.currentAlertLevel === AlertLevel.NORMAL &&
      this.memoryHistory.length % 5 === 0
    ) {
      this.log(
        `Memory usage: ${memoryUsage.rssMB}MB, Trend: ${memoryUsage.trend}, Growth: ${
          memoryUsage.growthRate.toFixed(2)
        }MB/min`,
        "INFO",
      );
    }
  }

  /**
   * Update throttling factor based on memory usage
   */
  private updateThrottlingFactor(usage: MemoryUsage): void {
    const { warningThresholdMB, criticalThresholdMB } = this.options;

    if (usage.rssMB < warningThresholdMB * 0.7) {
      // Below 70% of warning threshold - no throttling
      this.throttlingFactor = 1;
    } else if (
      usage.rssMB >= warningThresholdMB && usage.rssMB < criticalThresholdMB
    ) {
      // Between warning and critical - linear decrease
      const range = criticalThresholdMB - warningThresholdMB;
      const excess = usage.rssMB - warningThresholdMB;
      this.throttlingFactor = Math.max(0.3, 1 - (excess / range) * 0.7);
    } else if (usage.rssMB >= criticalThresholdMB) {
      // Above critical - severe throttling
      this.throttlingFactor = 0.2;
    } else {
      // Between 70% of warning and warning - slight throttling
      const approachRange = warningThresholdMB * 0.3;
      const excess = usage.rssMB - (warningThresholdMB * 0.7);
      this.throttlingFactor = Math.max(0.8, 1 - (excess / approachRange) * 0.2);
    }
  }

  /**
   * Check memory usage against thresholds and trigger appropriate actions
   */
  private checkThresholds(usage: MemoryUsage): void {
    const {
      warningThresholdMB,
      criticalThresholdMB,
      emergencyThresholdMB,
      recoveryThresholdMB,
    } = this.options;

    // Determine the appropriate alert level
    let newAlertLevel = AlertLevel.NORMAL;

    if (usage.rssMB >= emergencyThresholdMB) {
      newAlertLevel = AlertLevel.EMERGENCY;
    } else if (usage.rssMB >= criticalThresholdMB) {
      newAlertLevel = AlertLevel.CRITICAL;
    } else if (usage.rssMB >= warningThresholdMB) {
      newAlertLevel = AlertLevel.WARNING;
    } else if (
      this.currentAlertLevel !== AlertLevel.NORMAL &&
      usage.rssMB <= recoveryThresholdMB
    ) {
      // We've recovered from a previous alert
      this.log(`Memory usage recovered to ${usage.rssMB}MB`, "INFO");
    }

    // If alert level has changed, take appropriate action
    if (newAlertLevel !== this.currentAlertLevel) {
      this.handleAlertLevelChange(newAlertLevel, usage);
    }
  }

  /**
   * Handle changes in alert level
   */
  private handleAlertLevelChange(
    newLevel: AlertLevel,
    usage: MemoryUsage,
  ): void {
    this.currentAlertLevel = newLevel;

    switch (newLevel) {
      case AlertLevel.WARNING:
        this.log(`WARNING: Memory usage high (${usage.rssMB}MB)`, "WARNING");
        this.options.onWarning?.(usage);
        break;

      case AlertLevel.CRITICAL:
        this.log(
          `CRITICAL: Memory usage very high (${usage.rssMB}MB)`,
          "ERROR",
        );
        this.options.onCritical?.(usage);
        break;

      case AlertLevel.EMERGENCY:
        this.log(
          `EMERGENCY: Memory usage critical (${usage.rssMB}MB)`,
          "ERROR",
        );
        this.options.onEmergency?.(usage);
        break;
    }
  }

  /**
   * Log a message with the appropriate level
   */
  private log(message: string, level: "INFO" | "WARNING" | "ERROR"): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;

    // Save to history
    this.logHistory.push(logMessage);
    if (this.logHistory.length > 100) {
      this.logHistory.shift();
    }

    // Console logging
    if (this.options.logToConsole) {
      switch (level) {
        case "INFO":
          Logger.log(logMessage);
          break;
        case "WARNING":
          console.warn(logMessage);
          break;
        case "ERROR":
          console.error(logMessage);
          break;
      }
    }

    // File logging
    if (this.options.logToFile && this.options.logFilePath) {
      try {
        Deno.writeTextFileSync(
          this.options.logFilePath,
          logMessage + "\n",
          { append: true },
        );
      } catch (err) {
        console.error(`Failed to write to log file: ${err}`);
      }
    }
  }

  /**
   * Get memory usage history
   */
  getMemoryHistory(): MemoryUsage[] {
    return [...this.memoryHistory];
  }

  /**
   * Get log history
   */
  getLogHistory(): string[] {
    return [...this.logHistory];
  }

  /**
   * Get current memory usage
   */
  getCurrentUsage(): MemoryUsage | null {
    return this.memoryHistory[this.memoryHistory.length - 1] ?? null;
  }

  /**
   * Force garbage collection if available
   * Note: This requires running Deno with --v8-flags=--expose-gc
   */
  forceGarbageCollection(): boolean {
    // @ts-ignore: gc is not in the global types
    if (typeof globalThis.gc === "function") {
      // @ts-ignore: gc is not in the global types
      globalThis.gc();
      this.log("Manual garbage collection triggered", "INFO");
      return true;
    }
    this.log(
      "Manual garbage collection not available. Run Deno with --v8-flags=--expose-gc",
      "WARNING",
    );
    return false;
  }
}

/**
 * A worker pool that respects memory constraints
 */
class MemoryAwareWorkerPool {
  private memoryMonitor: MemoryMonitor;
  private maxWorkers: number;
  private activeWorkers: number = 0;
  private taskQueue: Array<() => Promise<void>> = [];
  private isProcessing: boolean = false;

  constructor(memoryMonitor: MemoryMonitor, maxWorkers: number = 4) {
    this.memoryMonitor = memoryMonitor;
    this.maxWorkers = maxWorkers;

    // Set up memory monitor handlers
    memoryMonitor.start();
  }

  /**
   * Add a task to the worker pool
   */
  addTask(task: () => Promise<void>): void {
    this.taskQueue.push(task);
    this.processQueue();
  }

  /**
   * Process the task queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      while (this.taskQueue.length > 0) {
        // Check available capacity based on memory conditions
        const availableCapacity = this.getAvailableCapacity();

        if (this.activeWorkers >= availableCapacity) {
          // No capacity right now, wait and check again
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }

        // Process next task
        const task = this.taskQueue.shift();
        if (task) {
          this.activeWorkers++;
          this.runTask(task).finally(() => {
            this.activeWorkers--;
            this.processQueue();
          });
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Run a task with proper error handling
   */
  private async runTask(task: () => Promise<void>): Promise<void> {
    try {
      await task();
    } catch (error) {
      console.error("Task execution error:", error);
    }
  }

  /**
   * Calculate available worker capacity based on memory conditions
   */
  private getAvailableCapacity(): number {
    const throttlingFactor = this.memoryMonitor.getThrottlingFactor();
    // Calculate dynamic capacity (at least 1, at most maxWorkers)
    return Math.max(1, Math.floor(this.maxWorkers * throttlingFactor));
  }

  /**
   * Get the current queue status
   */
  getStatus(): {
    activeWorkers: number;
    queuedTasks: number;
    memoryUsage: MemoryUsage | null;
  } {
    return {
      activeWorkers: this.activeWorkers,
      queuedTasks: this.taskQueue.length,
      memoryUsage: this.memoryMonitor.getCurrentUsage(),
    };
  }
}

export { MemoryAwareWorkerPool, MemoryMonitor };
