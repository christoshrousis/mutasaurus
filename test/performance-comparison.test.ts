#!/usr/bin/env deno run --allow-read --allow-write --allow-run --allow-env --allow-ffi

/**
 * Comprehensive performance comparison test
 *
 * Tests all three architectures:
 * 1. Ephemeral workers (original)
 * 2. Persistent workers
 * 3. In-memory mutations
 *
 * With two different fixture sets:
 * - many-files: 50 small files (tests parallelism across files)
 * - one-big-file: 1 large file (tests performance with many mutations in one file)
 */

import { Mutasaurus } from '../mod.ts';

console.log("\n" + "=".repeat(60));
console.log("COMPREHENSIVE PERFORMANCE COMPARISON");
console.log("=".repeat(60) + "\n");

interface TestResult {
  name: string;
  totalMutations: number;
  killedMutations: number;
  typeErrorMutations: number;
  survivedMutations: number;
  timedOutMutations: number;
  erroneousMutations: number;
  totalTime: number;
}

async function runTest(
  name: string,
  config: {
    sourceFiles: string[];
    testFiles: string[];
    timeout: number;
    usePersistentWorkers?: boolean;
    useInMemoryMutations?: boolean;
  }
): Promise<TestResult> {
  console.log(`\nRunning: ${name}...`);
  const startTime = performance.now();

  const mutasaurus = new Mutasaurus({
    ...config,
    debug: false,
  });

  const result = await mutasaurus.run(false);
  const totalTime = performance.now() - startTime;

  console.log(`  ✓ Completed in ${totalTime.toFixed(0)}ms`);
  console.log(`    Mutations: ${result.totalMutations} | Killed: ${result.killedMutations} | Type Errors: ${result.typeErrorMutations}`);

  return {
    name,
    totalMutations: result.totalMutations,
    killedMutations: result.killedMutations,
    typeErrorMutations: result.typeErrorMutations,
    survivedMutations: result.survivedMutations,
    timedOutMutations: result.timedOutMutations,
    erroneousMutations: result.erroneousMutations,
    totalTime,
  };
}

// Test Suite 1: Many Files (50 files, good for testing parallelism)
console.log("\n" + "=".repeat(60));
console.log("TEST SUITE 1: Many Files (50 source files)");
console.log("=".repeat(60));

const manyFilesConfig = {
  sourceFiles: ['test/fixtures/many-files/*.ts'],
  testFiles: ['test/fixtures/many-files/*.test.ts'],
  timeout: 5_000,
};

const manyFilesEphemeral = await runTest(
  "Ephemeral Workers",
  { ...manyFilesConfig }
);

const manyFilesPersistent = await runTest(
  "Persistent Workers",
  { ...manyFilesConfig, usePersistentWorkers: true }
);

const manyFilesInMemory = await runTest(
  "In-Memory Mutations",
  { ...manyFilesConfig, useInMemoryMutations: true }
);

// Test Suite 2: One Big File (1 file with many functions)
console.log("\n" + "=".repeat(60));
console.log("TEST SUITE 2: One Big File (1 file, 50+ functions)");
console.log("=".repeat(60));

const bigFileConfig = {
  sourceFiles: ['test/fixtures/one-big-file.ts'],
  testFiles: ['test/fixtures/one-big-file.test.ts'],
  timeout: 5_000,
};

const bigFileEphemeral = await runTest(
  "Ephemeral Workers",
  { ...bigFileConfig }
);

const bigFilePersistent = await runTest(
  "Persistent Workers",
  { ...bigFileConfig, usePersistentWorkers: true }
);

const bigFileInMemory = await runTest(
  "In-Memory Mutations",
  { ...bigFileConfig, useInMemoryMutations: true }
);

// Results Summary
console.log("\n" + "=".repeat(60));
console.log("RESULTS SUMMARY");
console.log("=".repeat(60));

function compareResults(baseline: TestResult, test: TestResult): string {
  const speedup = baseline.totalTime / test.totalTime;
  const timeSaved = baseline.totalTime - test.totalTime;
  const percentFaster = ((speedup - 1) * 100).toFixed(1);

  if (speedup > 1) {
    return `🚀 ${speedup.toFixed(2)}x faster (+${percentFaster}%, saved ${timeSaved.toFixed(0)}ms)`;
  } else {
    return `⚠️  ${speedup.toFixed(2)}x slower (${percentFaster}%, lost ${Math.abs(timeSaved).toFixed(0)}ms)`;
  }
}

console.log("\n--- Many Files (50 source files) ---");
console.log(`Ephemeral Workers:  ${manyFilesEphemeral.totalTime.toFixed(0)}ms (baseline)`);
console.log(`Persistent Workers: ${manyFilesPersistent.totalTime.toFixed(0)}ms - ${compareResults(manyFilesEphemeral, manyFilesPersistent)}`);
console.log(`In-Memory Mutations: ${manyFilesInMemory.totalTime.toFixed(0)}ms - ${compareResults(manyFilesEphemeral, manyFilesInMemory)}`);

console.log("\n--- One Big File (50+ functions) ---");
console.log(`Ephemeral Workers:  ${bigFileEphemeral.totalTime.toFixed(0)}ms (baseline)`);
console.log(`Persistent Workers: ${bigFilePersistent.totalTime.toFixed(0)}ms - ${compareResults(bigFileEphemeral, bigFilePersistent)}`);
console.log(`In-Memory Mutations: ${bigFileInMemory.totalTime.toFixed(0)}ms - ${compareResults(bigFileEphemeral, bigFileInMemory)}`);

// Verify correctness
console.log("\n" + "=".repeat(60));
console.log("CORRECTNESS VERIFICATION");
console.log("=".repeat(60));

function verifyResults(tests: TestResult[]): boolean {
  const baseline = tests[0];
  if (!baseline) return false;

  let allMatch = true;

  for (let i = 1; i < tests.length; i++) {
    const test = tests[i];
    if (!test) continue;

    if (
      test.totalMutations !== baseline.totalMutations ||
      test.killedMutations !== baseline.killedMutations ||
      test.typeErrorMutations !== baseline.typeErrorMutations ||
      test.survivedMutations !== baseline.survivedMutations
    ) {
      console.log(`❌ ${test.name} results don't match baseline!`);
      console.log(`   Expected: ${baseline.killedMutations} killed, ${baseline.typeErrorMutations} type errors`);
      console.log(`   Got:      ${test.killedMutations} killed, ${test.typeErrorMutations} type errors`);
      allMatch = false;
    }
  }

  return allMatch;
}

const manyFilesCorrect = verifyResults([manyFilesEphemeral, manyFilesPersistent, manyFilesInMemory]);
const bigFileCorrect = verifyResults([bigFileEphemeral, bigFilePersistent, bigFileInMemory]);

if (manyFilesCorrect) {
  console.log("✅ Many Files: All architectures produce identical results");
}

if (bigFileCorrect) {
  console.log("✅ One Big File: All architectures produce identical results");
}

// Final verdict
console.log("\n" + "=".repeat(60));
console.log("FINAL VERDICT");
console.log("=".repeat(60) + "\n");

if (manyFilesCorrect && bigFileCorrect) {
  console.log("✅ All tests passed! All architectures produce correct results.\n");

  // Performance recommendations
  const persistentManyFilesFaster = manyFilesPersistent.totalTime < manyFilesEphemeral.totalTime;
  const persistentBigFileFaster = bigFilePersistent.totalTime < bigFileEphemeral.totalTime;
  const inMemoryManyFilesFaster = manyFilesInMemory.totalTime < manyFilesEphemeral.totalTime;
  const inMemoryBigFileFaster = bigFileInMemory.totalTime < bigFileEphemeral.totalTime;

  console.log("Performance Recommendations:");
  if (persistentManyFilesFaster && persistentBigFileFaster) {
    console.log("  🚀 Persistent Workers show consistent speedup - RECOMMENDED for production");
  } else if (persistentManyFilesFaster || persistentBigFileFaster) {
    console.log("  ⚠️  Persistent Workers show mixed results - use for large codebases");
  }

  if (inMemoryManyFilesFaster && inMemoryBigFileFaster) {
    console.log("  🚀 In-Memory Mutations show consistent speedup - RECOMMENDED for production");
  } else if (inMemoryManyFilesFaster || inMemoryBigFileFaster) {
    console.log("  ⚠️  In-Memory Mutations show mixed results - test with your codebase");
  }

  console.log("");
} else {
  console.error("❌ Tests failed! Some architectures produce incorrect results.");
  Deno.exit(1);
}
