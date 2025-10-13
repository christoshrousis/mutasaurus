/**
 * In-Memory Worker
 *
 * Optimized worker that applies mutations directly to source files without
 * copying to temporary directories. This significantly improves performance
 * by eliminating file I/O overhead.
 *
 * Architecture:
 * - Backup original source file content
 * - Write mutated content directly to source file
 * - Run type check and tests against mutated file
 * - Restore original content
 * - Send results back
 *
 * IMPORTANT: This worker modifies source files in place, so it requires
 * careful synchronization to prevent race conditions. Only one mutation
 * per source file should run at a time.
 */

import { MutationRun } from "./mutasaurus.ts";
import { TestResult } from "./testRunner.ts";

declare const self: Worker;

self.onmessage = async (
  e: {
    data: {
      mutation: MutationRun;
      testFilePaths: string[];
      workingDirectory: string;
      noCheck: boolean;
    };
  },
) => {
  const startTime = performance.now();
  const { mutation, testFilePaths, workingDirectory, noCheck } = e.data;

  // Backup original content
  const originalContent = mutation.original.content;
  const sourceFilePath = mutation.original.path;

  try {
    // Write mutated content directly to source file
    await Deno.writeTextFile(sourceFilePath, mutation.mutation);

    // Run type checking if enabled
    if (!noCheck) {
      const typeCheckProcess = new Deno.Command("deno", {
        args: [
          "check",
          ...testFilePaths,
        ],
        stdout: "piped",
        stderr: "piped",
        cwd: workingDirectory,
      });

      const { code: typeCheckCode, stderr: typeCheckStderr } =
        await typeCheckProcess.output();

      // If type checking fails, this mutation caused a type error
      if (typeCheckCode !== 0) {
        const decodedError = new TextDecoder().decode(typeCheckStderr);
        const duration = performance.now() - startTime;
        mutation.status = "type-error";
        mutation.duration = duration;

        // Restore original content before returning
        await Deno.writeTextFile(sourceFilePath, originalContent);

        const testResult: TestResult = {
          mutation,
          outcome: "type-error",
          error: decodedError,
          duration,
        };
        self.postMessage(testResult);
        return;
      }
    }

    // If type checking passes (or is disabled), run the tests
    const process = new Deno.Command("deno", {
      args: [
        "test",
        "--allow-all",
        ...(noCheck ? ["--no-check"] : []),
        ...testFilePaths,
      ],
      stdout: "piped",
      stderr: "piped",
      cwd: workingDirectory,
    });

    const { code, stderr } = await process.output();

    const decodedError = new TextDecoder().decode(stderr);

    if (decodedError.includes("Test failed")) {
      mutation.status = "killed";
    } else {
      mutation.status = "survived";
    }

    const duration = performance.now() - startTime;
    mutation.duration = duration;

    // Restore original content
    await Deno.writeTextFile(sourceFilePath, originalContent);

    const testResult: TestResult = {
      mutation,
      outcome: code === 0 ? "tests-passed" : "tests-failed",
      duration,
    };
    if (code !== 0) testResult.error = decodedError;

    self.postMessage(testResult);
  } catch (error) {
    // Always restore original content on error
    try {
      await Deno.writeTextFile(sourceFilePath, originalContent);
    } catch (restoreError) {
      console.error("Failed to restore original content:", restoreError);
    }

    const duration = performance.now() - startTime;
    const testResult: TestResult = {
      mutation: {
        ...mutation,
        status: "error",
        duration,
      },
      outcome: "error",
      error: error instanceof Error ? error.message : String(error),
      duration,
    };
    self.postMessage(testResult);
  }
};
