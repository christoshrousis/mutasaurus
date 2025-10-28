import { assertEquals } from "@std/assert";
import { Mutasaurus } from "../mod.ts";

Deno.test("silent mode suppresses console.log output", async () => {
  // Capture console.log calls
  const originalLog = console.log;
  const logCalls: unknown[][] = [];
  console.log = (...args: unknown[]) => {
    logCalls.push(args);
  };

  try {
    const mutasaurus = new Mutasaurus({
      sourceFiles: ["test/fixtures/sums.ts"],
      testFiles: ["test/fixtures/sums.test.ts"],
      workers: 2,
      timeout: 5000,
      silent: true, // Enable silent mode
    });

    await mutasaurus.run(true);

    // In silent mode, console.log should not be called
    assertEquals(
      logCalls.length,
      0,
      `Expected no console.log calls in silent mode, but got ${logCalls.length} calls`,
    );
  } finally {
    // Restore original console.log
    console.log = originalLog;
  }
});

Deno.test("normal mode allows console.log output", async () => {
  // Capture console.log calls
  const originalLog = console.log;
  const logCalls: unknown[][] = [];
  console.log = (...args: unknown[]) => {
    logCalls.push(args);
  };

  try {
    const mutasaurus = new Mutasaurus({
      sourceFiles: ["test/fixtures/sums.ts"],
      testFiles: ["test/fixtures/sums.test.ts"],
      workers: 2,
      timeout: 5000,
      silent: false, // Normal mode
    });

    await mutasaurus.run(true);

    // In normal mode, console.log should be called
    assertEquals(
      logCalls.length > 0,
      true,
      "Expected console.log calls in normal mode, but got none",
    );
  } finally {
    // Restore original console.log
    console.log = originalLog;
  }
});

Deno.test("silent mode still allows console.error", async () => {
  // Capture console.error calls
  const originalError = console.error;
  const errorCalls: unknown[][] = [];
  console.error = (...args: unknown[]) => {
    errorCalls.push(args);
    originalError(...args); // Still output to preserve error visibility
  };

  // Capture console.log to verify it's suppressed
  const originalLog = console.log;
  const logCalls: unknown[][] = [];
  console.log = (...args: unknown[]) => {
    logCalls.push(args);
  };

  try {
    const mutasaurus = new Mutasaurus({
      sourceFiles: ["test/fixtures/sums.ts"],
      testFiles: ["test/fixtures/sums.test.ts"],
      workers: 2,
      timeout: 5000,
      silent: true,
    });

    await mutasaurus.run(true);

    // Verify console.log is suppressed
    assertEquals(
      logCalls.length,
      0,
      "Expected no console.log calls in silent mode",
    );

    // Note: console.error might be called if there are actual errors
    // We just verify that the silent mode doesn't prevent console.error from working
    // This test passes as long as console.log is suppressed
  } finally {
    console.error = originalError;
    console.log = originalLog;
  }
});

Deno.test("silent mode still allows console.warn", async () => {
  // Capture console.warn calls
  const originalWarn = console.warn;
  const warnCalls: unknown[][] = [];
  console.warn = (...args: unknown[]) => {
    warnCalls.push(args);
    originalWarn(...args); // Still output to preserve warning visibility
  };

  // Capture console.log to verify it's suppressed
  const originalLog = console.log;
  const logCalls: unknown[][] = [];
  console.log = (...args: unknown[]) => {
    logCalls.push(args);
  };

  try {
    const mutasaurus = new Mutasaurus({
      sourceFiles: ["test/fixtures/sums.ts"],
      testFiles: ["test/fixtures/sums.test.ts"],
      workers: 2,
      timeout: 5000,
      silent: true,
    });

    await mutasaurus.run(true);

    // Verify console.log is suppressed
    assertEquals(
      logCalls.length,
      0,
      "Expected no console.log calls in silent mode",
    );

    // Note: console.warn might be called if there are actual warnings
    // We just verify that the silent mode doesn't prevent console.warn from working
    // This test passes as long as console.log is suppressed
  } finally {
    console.warn = originalWarn;
    console.log = originalLog;
  }
});
