#!/usr/bin/env deno run --allow-read --allow-write --allow-run --allow-env --allow-ffi

/**
 * Performance test for mutation testing
 *
 * Tests performance with two different fixture sets:
 * - many-files: 50 small files (tests parallelism across files)
 * - one-big-file: 1 large file (tests performance with many mutations in one file)
 */

import { Mutasaurus } from '../mod.ts';

console.log("\n" + "=".repeat(60));
console.log("PERFORMANCE TEST");
console.log("=".repeat(60) + "\n");

interface TestResult {
  name: string;
  totalMutations: number;
  killedMutations: number;
  typeErrorMutations: number;
  survivedMutations: number;
  timedOutMutations: number;
  erroneousMutations: number;
  incompleteMutations: number;
  totalTime: number;
}

async function runTest(
  name: string,
  config: {
    sourceFiles: string[];
    testFiles: string[];
    timeout: number;
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
    incompleteMutations: result.incompleteMutations,
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

const manyFilesResult = await runTest(
  "Many Files Test",
  { ...manyFilesConfig }
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

const bigFileResult = await runTest(
  "One Big File Test",
  { ...bigFileConfig }
);

// Results Summary
console.log("\n" + "=".repeat(60));
console.log("RESULTS SUMMARY");
console.log("=".repeat(60));

console.log("\n--- Many Files (50 source files) ---");
console.log(`Total Mutations: ${manyFilesResult.totalMutations}`);
console.log(`Killed: ${manyFilesResult.killedMutations}`);
console.log(`Type Errors: ${manyFilesResult.typeErrorMutations}`);
console.log(`Survived: ${manyFilesResult.survivedMutations}`);
console.log(`Timed Out: ${manyFilesResult.timedOutMutations}`);
console.log(`Erroneous: ${manyFilesResult.erroneousMutations}`);
console.log(`Incomplete: ${manyFilesResult.incompleteMutations}`);
console.log(`Total Time: ${manyFilesResult.totalTime.toFixed(0)}ms`);

console.log("\n--- One Big File (50+ functions) ---");
console.log(`Total Mutations: ${bigFileResult.totalMutations}`);
console.log(`Killed: ${bigFileResult.killedMutations}`);
console.log(`Type Errors: ${bigFileResult.typeErrorMutations}`);
console.log(`Survived: ${bigFileResult.survivedMutations}`);
console.log(`Timed Out: ${bigFileResult.timedOutMutations}`);
console.log(`Erroneous: ${bigFileResult.erroneousMutations}`);
console.log(`Incomplete: ${bigFileResult.incompleteMutations}`);
console.log(`Total Time: ${bigFileResult.totalTime.toFixed(0)}ms`);

// Final verdict
console.log("\n" + "=".repeat(60));
console.log("FINAL VERDICT");
console.log("=".repeat(60) + "\n");

console.log("✅ All performance tests completed successfully!\n");
