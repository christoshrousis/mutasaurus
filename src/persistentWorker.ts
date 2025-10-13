/**
 * Persistent Worker
 *
 * A long-lived worker that processes mutations sequentially.
 * Unlike the original worker.ts which terminates after each mutation,
 * this worker stays alive and waits for new tasks.
 *
 * Architecture:
 * - Worker enters a message loop on startup
 * - Receives mutation tasks via postMessage
 * - Processes each task (type check + test run)
 * - Sends results back to main thread
 * - Waits for next task
 * - Only terminates on shutdown message
 */

import { TestResult } from "./testRunner.ts";
import {
  WorkerMessage,
  WorkerResponse,
  WorkerTask,
} from "./persistentWorkerPool.ts";

declare const self: Worker;

const ensureDirectoryExists = (filePath: string): void => {
  const dirPath = filePath.substring(0, filePath.lastIndexOf("/"));
  if (dirPath) {
    Deno.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Process a single mutation task
 */
async function processTask(task: WorkerTask): Promise<TestResult> {
  const startTime = performance.now();
  const {
    mutation,
    sourceFiles,
    testFiles,
    workingDirectory: workingDirectoryIn,
    noCheck,
  } = task;

  // Create a temporary working directory for the mutation using absolute path
  const workingDirectory = `${workingDirectoryIn}/.mutasaurus/${
    Math.random().toString(36).substring(7)
  }`;
  Deno.mkdirSync(workingDirectory, { recursive: true });

  try {
    // Copy test files
    for (const testFile of testFiles) {
      const targetPath = `${workingDirectory}/${testFile.relativePath}`;
      ensureDirectoryExists(targetPath);
      await Deno.copyFile(testFile.path, targetPath);
    }

    // Copy source files
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

    // Run type checking if enabled
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

        // Clean up
        try {
          await Deno.remove(workingDirectory, { recursive: true });
        } catch (_) {
          // Ignore cleanup errors
        }

        return {
          mutation,
          outcome: "type-error",
          error: decodedError,
          duration,
        };
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

    // Clean up
    try {
      await Deno.remove(workingDirectory, { recursive: true });
    } catch (_) {
      // Ignore cleanup errors
    }

    const testResult: TestResult = {
      mutation,
      outcome: code === 0 ? "tests-passed" : "tests-failed",
      duration,
    };
    if (code !== 0) testResult.error = decodedError;

    return testResult;
  } catch (error) {
    // Clean up on error
    try {
      await Deno.remove(workingDirectory, { recursive: true });
    } catch (_) {
      // Ignore cleanup errors
    }

    const duration = performance.now() - startTime;
    return {
      mutation: {
        ...mutation,
        status: "error",
        duration,
      },
      outcome: "error",
      error: error instanceof Error ? error.message : String(error),
      duration,
    };
  }
}

/**
 * Main worker message loop
 */
self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const message = e.data;

  switch (message.type) {
    case "execute": {
      if (!message.task || !message.taskId) {
        const errorResponse: WorkerResponse = {
          type: "error",
          taskId: message.taskId,
          error: "Invalid task message",
        };
        self.postMessage(errorResponse);
        return;
      }

      try {
        const result = await processTask(message.task);

        const response: WorkerResponse = {
          type: "result",
          taskId: message.taskId,
          result,
        };
        self.postMessage(response);
      } catch (error) {
        const errorResponse: WorkerResponse = {
          type: "error",
          taskId: message.taskId,
          error: error instanceof Error ? error.message : String(error),
        };
        self.postMessage(errorResponse);
      }
      break;
    }

    case "shutdown": {
      // Worker is being shut down, exit gracefully
      (self as any).close();
      break;
    }

    default: {
      const errorResponse: WorkerResponse = {
        type: "error",
        error: `Unknown message type: ${(message as unknown as { type?: string | null })?.type}`,
      };
      self.postMessage(errorResponse);
    }
  }
};

// Signal that worker is ready to receive tasks
const readyMessage: WorkerResponse = {
  type: "ready",
};
self.postMessage(readyMessage);
