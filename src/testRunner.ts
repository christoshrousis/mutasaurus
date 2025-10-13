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

import { expandGlob } from "@std/fs";
import { MutationRun } from "../mod.ts";
import { MemoryAwareWorkerPool, MemoryMonitor } from "./memoryMonitor.ts";

type File = {
  path: string;
  relativePath: string;
  content: string;
};

type SourceFile = File;
type TestFile = File;

export type TestFileToSourceFileMapError = {
  testFile: TestFile;
  coveragePath: string;
  error: string;
};

/**
 * The result of a test run.
 *
 * Contains the original mutation run object,
 * and reports back on it's status after a test run is complete.
 */
export interface TestResult {
  mutation: MutationRun;
  /** Outcome of the worker process */
  outcome:
    | "tests-passed"
    | "tests-failed"
    | "timed-out"
    | "error"
    | "type-error";
  /**
   * The error that occurred during the test run, if any.
   */
  error?: string;
  duration: number;
}

export class TestRunner {
  // Configuration helpers.
  private workers: number;
  private timeout: number;
  private debug: boolean;
  private noCheck: boolean;
  private timeoutMultiplier: number;
  private dynamicTimeout: number | null = null;

  constructor(
    workers: number,
    timeout: number,
    debug: boolean,
    noCheck: boolean,
    timeoutMultiplier: number = 3,
  ) {
    this.workers = workers;
    this.timeout = timeout;
    this.debug = debug;
    this.noCheck = noCheck;
    this.timeoutMultiplier = timeoutMultiplier;
  }

  async runTests(
    mutations: MutationRun[],
    sourceFiles: SourceFile[],
    testFiles: TestFile[],
    workingDirectoryIn: string,
  ): Promise<TestResult[]> {
    const results: TestResult[] = [];

    const monitor = new MemoryMonitor({
      warningThresholdMB: 500,
      criticalThresholdMB: 800,
      emergencyThresholdMB: 1200,
      logToFile: this.debug,
      logToConsole: this.debug,
      logFilePath: "./memory-monitor.log",
      onWarning: (usage) => {
        console.warn(
          `Memory warning: ${usage.rssMB}MB used. Slowing down task processing.`,
        );
      },
      onCritical: (usage) => {
        console.error(
          `Memory critical: ${usage.rssMB}MB used. Stopping new tasks.`,
        );
      },
      onEmergency: (usage) => {
        console.error(
          `Memory emergency: ${usage.rssMB}MB used. Taking emergency actions.`,
        );
        monitor.forceGarbageCollection();
      },
    });

    const workerPool = new MemoryAwareWorkerPool(monitor, this.workers);

    const runWorkerTask = (
      { mutation, sourceFiles, testFiles, workingDirectory }: {
        mutation: MutationRun;
        sourceFiles: SourceFile[];
        testFiles: TestFile[];
        workingDirectory: string;
      },
    ): Promise<TestResult> => {
      return new Promise<TestResult>((resolve) => {
        const worker = new Worker(
          new URL("./worker.ts", import.meta.url).href,
          {
            type: "module",
          },
        );

        // Use dynamic timeout if available, otherwise fall back to static timeout
        const effectiveTimeout = this.dynamicTimeout ?? this.timeout;

        const timeoutId = setTimeout(() => {
          const timedOutResult: TestResult = {
            mutation: {
              ...mutation,
              status: "timed-out",
              duration: effectiveTimeout,
            },
            outcome: "timed-out",
            duration: effectiveTimeout,
          };
          worker.terminate();
          resolve(timedOutResult);
        }, effectiveTimeout);

        worker.onmessage = (e: { data: TestResult }) => {
          clearTimeout(timeoutId);
          worker.terminate();
          resolve(e.data);
        };

        worker.onerror = (error) => {
          clearTimeout(timeoutId);
          worker.terminate();
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

        worker.postMessage({
          mutation,
          sourceFiles,
          testFiles,
          workingDirectoryIn: workingDirectory,
          noCheck: this.noCheck,
        });
      });
    };

    // Create an array of promises for all tasks
    const taskPromises = mutations.map((mutation) => {
      return new Promise<TestResult>((resolve) => {
        workerPool.addTask(async () => {
          const result = await runWorkerTask(
            {
              mutation,
              sourceFiles,
              testFiles,
              workingDirectory: workingDirectoryIn,
            },
          );
          results.push(result);
          resolve(result);
        });
      });
    });

    // Start status monitoring
    const statusInterval = setInterval(async () => {
      const status = workerPool.getStatus();
      const replaceLine = this.debug ? "" : "\r";
      const percentageComplete = 100 -
        ((status.queuedTasks / taskPromises.length) *
          100);
      const encoder = new TextEncoder();
      await Deno.stdout.write(
        encoder.encode(
          `${replaceLine}Status: Active=${status.activeWorkers}, Queued=${status.queuedTasks}, Total=${taskPromises.length} Memory=${
            status.memoryUsage?.rssMB || 0
          }MB, ${percentageComplete.toFixed(2)}% complete`,
        ),
      );
    }, 1000);

    try {
      // Wait for all tasks to complete
      await Promise.all(taskPromises);
      return results;
    } finally {
      // Clean up
      clearInterval(statusInterval);
      monitor.stop();
      console.log("\nAll tasks completed");
    }
  }

  public async initialTestRunsWithCoverage({
    sourceFiles,
    testFiles,
    workingDirectoryIn,
  }: {
    sourceFiles: SourceFile[];
    testFiles: TestFile[];
    workingDirectoryIn: string;
  }): Promise<
    {
      sourceFileToTestFileCoverage: Map<
        SourceFile["relativePath"],
        Array<TestFile["relativePath"]>
      >;
      errors: TestFileToSourceFileMapError[];
    }
  > {
    const sourceFileToTestFileCoverage = new Map<
      SourceFile["relativePath"],
      Array<TestFile["relativePath"]>
    >();
    const errors: TestFileToSourceFileMapError[] = [];
    const currentWorkingDirectory = workingDirectoryIn;

    // Create a working directory for the test file, with the test file name for traceability.
    const workingDirectory =
      `${currentWorkingDirectory}/.mutasaurus/initialTestRunCoverage-${
        Math.random().toString(36).substring(7)
      }`;
    Deno.mkdirSync(workingDirectory, { recursive: true });

    // Track timing for dynamic timeout calculation
    const testRunTimes: number[] = [];

    /**
     * Run test suite with coverage, on a per test file basis to get coverage
     * of each individual source file.
     */
    for (const testFile of testFiles) {
      const coveragePath = `${workingDirectory}/${testFile.relativePath}/`;
      const testStartTime = performance.now();

      const process = new Deno.Command("deno", {
        args: [
          "test",
          "--allow-all",
          ...(this.noCheck ? ["--no-check"] : []),
          `--coverage=${coveragePath}`,
          testFile.path,
        ],
        stdout: "piped",
        stderr: "piped",
        cwd: workingDirectory,
      });

      const { success, stderr } = await process.output();
      const testDuration = performance.now() - testStartTime;
      testRunTimes.push(testDuration);
      if (!success) {
        const error = new TextDecoder().decode(stderr);
        errors.push({
          testFile,
          coveragePath,
          error,
        });
      }

      // read each json file in the coverage path, and parse it as json
      const coverageFiles = await expandGlob(`${coveragePath}/**/*.json`);
      for await (const file of coverageFiles) {
        const coverageFile = await Deno.readTextFile(file.path);
        const coverage = JSON.parse(coverageFile);
        const coverageFilePath = coverage.url.replace("file://", "");

        const isASourceFile = sourceFiles.some((sourceFile) =>
          sourceFile.path === coverageFilePath
        );
        if (isASourceFile) {
          const currentCoverage =
            sourceFileToTestFileCoverage.get(coverageFilePath) ?? [];
          currentCoverage.push(testFile.path);
          sourceFileToTestFileCoverage.set(
            coverageFilePath,
            currentCoverage,
          );
        }
      }
    }

    // Calculate dynamic timeout based on baseline measurements
    if (this.timeoutMultiplier > 0 && testRunTimes.length > 0) {
      // Use the maximum test run time as baseline (slowest test file)
      const maxTestTime = Math.max(...testRunTimes);

      // Calculate dynamic timeout: slowest test * multiplier
      // Use a minimum of the configured static timeout
      this.dynamicTimeout = Math.max(
        this.timeout,
        Math.ceil(maxTestTime * this.timeoutMultiplier),
      );

      if (this.debug) {
        console.log(`\nDynamic timeout calculation:`);
        console.log(
          `  - Test run times: ${
            testRunTimes.map((t) => Math.round(t)).join(", ")
          }ms`,
        );
        console.log(`  - Slowest test: ${Math.round(maxTestTime)}ms`);
        console.log(`  - Timeout multiplier: ${this.timeoutMultiplier}x`);
        console.log(`  - Calculated timeout: ${this.dynamicTimeout}ms`);
        console.log(`  - Static timeout: ${this.timeout}ms`);
      }
    }

    return { sourceFileToTestFileCoverage, errors };
  }
}
