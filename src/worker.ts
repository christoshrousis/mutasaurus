/**
 * worker.ts
 *
 * This file is the main entry point for the worker.
 * It receives a test instruction  from {@linkcode TestRunner.runTests},
 *
 * It will create a temporary working directory for the mutation,
 * copy the source and test files into the working directory,
 * copy the mutation into the working directory,
 * and then execute the tests against the mutation.
 */

import { TestResult } from "./testRunner.ts";

const ensureDirectoryExists = (filePath: string): void => {
  const dirPath = filePath.substring(0, filePath.lastIndexOf("/"));
  if (dirPath) {
    Deno.mkdirSync(dirPath, { recursive: true });
  }
};

self.onmessage = async (e) => {
  const startTime = performance.now();

  const { sourceFiles, testFiles, mutation } = e.data;

  // Create a temporary working directory for the mutation using absolute path
  const workingDirectory = `${Deno.cwd()}/.mutasaurus/${
    Math.random().toString(36).substring(7)
  }`;
  Deno.mkdirSync(workingDirectory, { recursive: true });

  // Copy all source and test files into the working directory
  for (const sourceFile of sourceFiles) {
    const content = await Deno.readTextFile(sourceFile);
    const targetPath = `${workingDirectory}/${sourceFile}`;
    ensureDirectoryExists(targetPath);
    Deno.writeTextFileSync(targetPath, content);
  }

  for (const testFile of testFiles) {
    const content = await Deno.readTextFile(testFile);
    const targetPath = `${workingDirectory}/${testFile}`;
    ensureDirectoryExists(targetPath);
    Deno.writeTextFileSync(targetPath, content);
  }

  // Copy the mutation into the working directory
  const mutationTargetPath =
    `${workingDirectory}/${mutation.original.filePath}`;
  ensureDirectoryExists(mutationTargetPath);
  Deno.writeTextFileSync(mutationTargetPath, mutation.mutation);

  try {
    const process = new Deno.Command("deno", {
      args: [
        "test",
        "--allow-read",
        "--allow-write",
        "--allow-run",
        workingDirectory,
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
