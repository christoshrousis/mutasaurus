/**
 * worker.ts
 *
 * This file is the main entry point for the worker.
 * It receives a test instruction from {@linkcode TestRunner.runTests},
 *
 * It will create a temporary working directory for the mutation,
 * copy the source and test files into the working directory,
 * copy the mutation into the working directory,
 * and then execute the tests against the mutation.
 */

import { SourceFile, TestFile } from "./findSourceAndTestFiles.ts";
import { MutationRun } from "./mutasaurus.ts";
import { TestResult } from "./testRunner.ts";

const ensureDirectoryExists = (filePath: string): void => {
  const dirPath = filePath.substring(0, filePath.lastIndexOf("/"));
  if (dirPath) {
    Deno.mkdirSync(dirPath, { recursive: true });
  }
};

declare const self: Worker;

self.onmessage = async (
  e: {
    data: {
      mutation: MutationRun;
      sourceFiles: SourceFile[];
      testFiles: TestFile[];
      workingDirectoryIn: string;
      noCheck: boolean;
    };
  },
) => {
  const startTime = performance.now();
  const { mutation, sourceFiles, testFiles, workingDirectoryIn, noCheck } =
    e.data;

  // Create a temporary working directory for the mutation using absolute path
  const workingDirectory = `${workingDirectoryIn}/.mutasaurus/${
    Math.random().toString(36).substring(7)
  }`;
  Deno.mkdirSync(workingDirectory, { recursive: true });

  for (const testFile of testFiles) {
    const targetPath = `${workingDirectory}/${testFile.relativePath}`;
    ensureDirectoryExists(targetPath);
    await Deno.copyFile(testFile.path, targetPath);
  }

  for (const sourceFile of sourceFiles) {
    const targetPath = `${workingDirectory}/${sourceFile.relativePath}`;
    ensureDirectoryExists(targetPath);
    await Deno.copyFile(sourceFile.path, targetPath);
  }

  // Copy the mutation into the working directory
  const relativePath = mutation.original.path.replace(workingDirectoryIn, "");
  const mutationTargetPath = `${workingDirectory}/${relativePath}`;
  ensureDirectoryExists(mutationTargetPath);
  Deno.writeTextFileSync(mutationTargetPath, mutation.mutation);

  // Prepare test files to run list
  const testFilesToRun = mutation.testFilesToRun.map((testFile) => {
    const relativePath = testFile.replace(workingDirectoryIn, "");
    return `${workingDirectory}/${relativePath}`;
  });

  try {
    // First, run type checking if type checking is enabled (noCheck is false)
    if (!noCheck) {
      const typeCheckProcess = new Deno.Command("deno", {
        args: [
          "check",
          ...testFilesToRun,
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
        ...testFilesToRun,
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

    const testResult: TestResult = {
      mutation,
      outcome: code === 0 ? "tests-passed" : "tests-failed",
      duration,
    };
    if (code !== 0) testResult.error = decodedError;

    self.postMessage(testResult);
  } catch (error) {
    const duration = performance.now() - startTime;
    const testResult: TestResult = {
      mutation,
      outcome: "error",
      error: error instanceof Error ? error.message : String(error),
      duration,
    };
    self.postMessage(testResult);
  }
};
