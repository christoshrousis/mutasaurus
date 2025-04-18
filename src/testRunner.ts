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

const ensureDirectoryExists = (filePath: string): void => {
  const dirPath = filePath.substring(0, filePath.lastIndexOf("/"));
  if (dirPath) {
    Deno.mkdirSync(dirPath, { recursive: true });
  }
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
    Map<SourceFile["relativePath"], Array<TestFile["relativePath"]>>
  > {
    const sourceFileToTestFileCoverage = new Map<
      SourceFile["relativePath"],
      Array<TestFile["relativePath"]>
    >();
    const currentWorkingDirectory = workingDirectoryIn;

    // Create a working directory for the test file, with the test file name for traceability.
    const workingDirectory =
      `${currentWorkingDirectory}/.mutasaurus/initialTestRun-${
        Math.random().toString(36).substring(7)
      }`;
    Deno.mkdirSync(workingDirectory, { recursive: true });

    /**
     * Copy all test files into the working directory
     */
    for (const testFile of testFiles) {
      const testFilePath = `${workingDirectory}/${testFile.relativePath}`;
      ensureDirectoryExists(testFilePath);
      Deno.writeTextFileSync(testFilePath, testFile.content);
    }

    /**
     * Copy all source files into the working directory
     */
    for (const sourceFile of sourceFiles) {
      const sourceFilePath = `${workingDirectory}/${sourceFile.relativePath}`;
      ensureDirectoryExists(sourceFilePath);
      Deno.writeTextFileSync(sourceFilePath, sourceFile.content);
    }

    /**
     * Run test suite with coverage, on a per test file basis to get coverage
     * of each individual source file.
     */
    for (const testFile of testFiles) {
      const testFilePath = `${workingDirectory}/${testFile.relativePath}`;
      const coveragePath =
        `${workingDirectory}/coverage${testFile.relativePath}/`;
      const process = new Deno.Command("deno", {
        args: [
          "test",
          "--allow-read",
          "--allow-write",
          "--allow-run",
          `--coverage=${coveragePath}`,
          testFilePath,
        ],
        stdout: "piped",
        stderr: "piped",
      });

      const { success, stderr } = await process.output();
      if (!success) {
        const decodedError = new TextDecoder().decode(stderr);
        console.error(decodedError);
      }

      // read each json file in the coverage path, and parse it as json
      const coverageFiles = await expandGlob(`${coveragePath}/**/*.json`);
      for await (const file of coverageFiles) {
        const coverageFile = await Deno.readTextFile(file.path);
        const coverage = JSON.parse(coverageFile);
        const coverageFilePath = coverage.url.replace("file://", "");
        const coverageRelativePath = coverageFilePath.replace(
          workingDirectory,
          "",
        );

        const isASourceFile = sourceFiles.some((sourceFile) =>
          sourceFile.relativePath === coverageRelativePath
        );
        if (isASourceFile) {
          const currentCoverage =
            sourceFileToTestFileCoverage.get(coverageRelativePath) ?? [];
          currentCoverage.push(testFile.relativePath);
          sourceFileToTestFileCoverage.set(
            coverageRelativePath,
            currentCoverage,
          );
        }
      }
    }

    return sourceFileToTestFileCoverage;
  }

  private createWorker(): Worker {
    const worker = new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module",
    });
    return worker;
  }
}
