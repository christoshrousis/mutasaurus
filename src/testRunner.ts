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
  outcome: "tests-passed" | "tests-failed" | "timed-out" | "error";
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

  constructor(workers: number, timeout: number) {
    this.workers = workers;
    this.timeout = timeout;
  }

  async runTests(
    mutations: MutationRun[],
    sourceFiles: SourceFile[],
    testFiles: TestFile[],
    workingDirectoryIn: string,
  ): Promise<TestResult[]> {
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

          worker!.postMessage({
            mutation,
            sourceFiles,
            testFiles,
            workingDirectoryIn,
          });
        });
        results.push(result);
      } catch (error) {
        console.error(error);
      } finally {
        activeWorkers.delete(worker);
      }
    });

    await Promise.all(testPromises);
    // Clean up all workers
    workerPool.forEach((worker) => worker.terminate());
    return results;
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

    /**
     * Run test suite with coverage, on a per test file basis to get coverage
     * of each individual source file.
     */
    for (const testFile of testFiles) {
      const coveragePath = `${workingDirectory}/${testFile.relativePath}/`;
      const process = new Deno.Command("deno", {
        args: [
          "test",
          "--allow-read",
          "--allow-write",
          "--allow-run",
          "--allow-ffi",
          `--coverage=${coveragePath}`,
          testFile.path,
        ],
        stdout: "piped",
        stderr: "piped",
        cwd: workingDirectory,
      });

      const { success, stderr } = await process.output();
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

    return { sourceFileToTestFileCoverage, errors };
  }

  private createWorker(): Worker {
    const worker = new Worker(new URL("./worker.ts", import.meta.url).href, {
      type: "module",
    });
    return worker;
  }
}
