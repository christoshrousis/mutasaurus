/**
 * Understanding Workers
 *
 * Create worker (inactive)
 * Wait for available worker from pool
 * Send message to worker with postMessage()
 * Worker starts executing when it receives the message
 * Worker sends back results via onmessage
 * Main thread receives results and resolves the promise
 */

import { MutasaurusConfig, MutationRun } from "../mod.ts";

/**
 * The result of a test run.
 *
 * Contains the original mutation run object,
 * and reports back on it's status after a test run is complete.
 */
export interface TestResult {
  mutation: MutationRun;
  /** Outcome of the worker process */
  outcome: "tests-passed" | "tests-failed" | "timed-out" | "error";
  /**
   * The error that occurred during the test run, if any.
   */
  error?: string;
  duration: number;
}

export class TestRunner {
  private workers: number;
  private timeout: number;

  constructor(workers: number, timeout: number) {
    this.workers = workers;
    this.timeout = timeout;
  }

  async runTests({
    mutations,
    sourceFiles,
    testFiles,
  }: {
    mutations: MutationRun[];
    sourceFiles: MutasaurusConfig["sourceFiles"];
    testFiles: MutasaurusConfig["testFiles"];
  }): Promise<TestResult[]> {
    const results: TestResult[] = [];
    const workerPool = Array.from(
      { length: this.workers },
      () => this.createWorker(),
    );
    const activeWorkers = new Set<Worker>();

    // Process test files in parallel using the worker pool
    const testPromises = mutations.map(async (mutation) => {
      // Wait for an available worker
      let worker: Worker | undefined;
      while (!worker) {
        for (const w of workerPool) {
          if (!activeWorkers.has(w)) {
            worker = w;
            break;
          }
        }
        if (!worker) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      activeWorkers.add(worker);
      try {
        const result = await new Promise<TestResult>((resolve) => {
          const timeoutId = setTimeout(() => {
            const timedOutResult: TestResult = {
              mutation: {
                ...mutation,
                status: "timed-out",
                duration: this.timeout,
              },
              outcome: "timed-out",
              duration: this.timeout,
            };
            resolve(timedOutResult);
          }, this.timeout);

          worker!.onmessage = (e: { data: TestResult }) => {
            clearTimeout(timeoutId);
            resolve(e.data);
          };

          worker!.onerror = (error) => {
            clearTimeout(timeoutId);
            const errorResult: TestResult = {
              mutation: {
                ...mutation,
                status: "error",
                duration: 0,
              },
              outcome: "error",
              error: error instanceof Error ? error.message : String(error),
              duration: 0,
            };
            resolve(errorResult);
          };

          worker!.postMessage({ sourceFiles, testFiles, mutation });
        });
        results.push(result);
      } finally {
        activeWorkers.delete(worker);
      }
    });

    await Promise.all(testPromises);
    // Clean up all workers
    workerPool.forEach((worker) => worker.terminate());
    return results;
  }

  private createWorker(): Worker {
    const worker = new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module",
    });
    return worker;
  }
}
