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
import { PersistentWorkerPool, WorkerTask } from "./persistentWorkerPool.ts";
import { Logger } from "./logger.ts";

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
 * Enhanced coverage data that includes the raw V8 coverage JSON.
 * This preserves coverage information for future line-level analysis.
 */
export type EnhancedCoverageData = {
  /** The test file that provided this coverage */
  testFile: TestFile;
  /** The raw V8 coverage JSON data (for future line-level parsing) */
  coverageJson?: unknown;
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
  private pool: PersistentWorkerPool | null = null;

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

  /**
   * Immediately shutdown the worker pool.
   * Used when global timeout is reached.
   */
  async immediateShutdown(): Promise<void> {
    if (this.pool) {
      await this.pool.shutdown();
    }
  }

  runTests(
    mutations: MutationRun[],
    sourceFiles: SourceFile[],
    testFiles: TestFile[],
    workingDirectoryIn: string,
  ): Promise<TestResult[]> {
    return this.runTestsWithPersistentPool(
      mutations,
      sourceFiles,
      testFiles,
      workingDirectoryIn,
    );
  }

  /**
   * Run tests using persistent worker pool (new architecture)
   */
  private async runTestsWithPersistentPool(
    mutations: MutationRun[],
    sourceFiles: SourceFile[],
    testFiles: TestFile[],
    workingDirectoryIn: string,
  ): Promise<TestResult[]> {
    const results: TestResult[] = [];
    const effectiveTimeout = this.dynamicTimeout ?? this.timeout;

    // Initialize persistent worker pool
    this.pool = new PersistentWorkerPool(
      this.workers,
      effectiveTimeout,
      this.debug,
    );

    try {
      await this.pool.initialize();

      if (this.debug) {
        Logger.log(
          `Running ${mutations.length} mutations with persistent worker pool...`,
        );
      }

      // Create tasks for all mutations
      const taskPromises = mutations.map(async (mutation) => {
        const task: WorkerTask = {
          mutation,
          sourceFiles,
          testFiles,
          workingDirectory: workingDirectoryIn,
          noCheck: this.noCheck,
        };

        const result = await this.pool!.executeTask(task, effectiveTimeout);
        results.push(result);
        return result;
      });

      // Start status monitoring
      const statusInterval = setInterval(() => {
        const status = this.pool!.getStatus();
        const replaceLine = this.debug ? "" : "\r";
        const percentageComplete = (status.tasksCompleted / mutations.length) *
          100;
        const encoder = new TextEncoder();
        Logger.stdoutWrite(
          encoder.encode(
            `${replaceLine}Status: Active=${status.activeWorkers}/${status.totalWorkers}, Queued=${status.queuedTasks}, Completed=${status.tasksCompleted}/${mutations.length}, ${
              percentageComplete.toFixed(2)
            }% complete`,
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
        Logger.log("\nAll tasks completed");
      }
    } finally {
      // Shutdown pool
      await this.pool.shutdown();
      this.pool = null;
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
      // Enhanced coverage data for extended reports
      enhancedCoverageData: Map<
        SourceFile["relativePath"],
        Array<EnhancedCoverageData>
      >;
      errors: TestFileToSourceFileMapError[];
    }
  > {
    const sourceFileToTestFileCoverage = new Map<
      SourceFile["relativePath"],
      Array<TestFile["relativePath"]>
    >();
    // Store enhanced coverage data for extended reports
    const enhancedCoverageData = new Map<
      SourceFile["relativePath"],
      Array<EnhancedCoverageData>
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
          // Store file-level coverage (original behavior)
          const currentCoverage =
            sourceFileToTestFileCoverage.get(coverageFilePath) ?? [];
          currentCoverage.push(testFile.path);
          sourceFileToTestFileCoverage.set(
            coverageFilePath,
            currentCoverage,
          );

          // Store enhanced coverage data for extended reports
          const currentEnhancedCoverage =
            enhancedCoverageData.get(coverageFilePath) ?? [];
          currentEnhancedCoverage.push({
            testFile,
            coverageJson: coverage,
          });
          enhancedCoverageData.set(
            coverageFilePath,
            currentEnhancedCoverage,
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
        Logger.log(`\nDynamic timeout calculation:`);
        Logger.log(
          `  - Test run times: ${
            testRunTimes.map((t) => Math.round(t)).join(", ")
          }ms`,
        );
        Logger.log(`  - Slowest test: ${Math.round(maxTestTime)}ms`);
        Logger.log(`  - Timeout multiplier: ${this.timeoutMultiplier}x`);
        Logger.log(`  - Calculated timeout: ${this.dynamicTimeout}ms`);
        Logger.log(`  - Static timeout: ${this.timeout}ms`);
      }
    }

    return { sourceFileToTestFileCoverage, enhancedCoverageData, errors };
  }
}
