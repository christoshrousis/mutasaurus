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

self.onmessage = async (
  e: {
    data: {
      mutation: MutationRun;
      sourceFiles: SourceFile[];
      testFiles: TestFile[];
    };
  },
) => {
  const startTime = performance.now();

  const { mutation, sourceFiles, testFiles } = e.data;

  // Create a temporary working directory for the mutation using absolute path
  const workingDirectory = `${Deno.cwd()}/.mutasaurus/${
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
  const mutationTargetPath =
    `${workingDirectory}/${mutation.original.relativePath}`;
  ensureDirectoryExists(mutationTargetPath);
  Deno.writeTextFileSync(mutationTargetPath, mutation.mutation);

  // Prepare test files to run list
  const testFilesToRun = mutation.testFilesToRun.map((testFile) =>
    `${workingDirectory}/${testFile}`
  );

  try {
    const process = new Deno.Command("deno", {
      args: [
        "test",
        "--allow-read",
        "--allow-write",
        "--allow-run",
        ...testFilesToRun,
      ],
      stdout: "piped",
      stderr: "piped",
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
