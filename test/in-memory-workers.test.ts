#!/usr/bin/env deno run --allow-read --allow-write --allow-run --allow-env --allow-ffi

/**
 * Test script to verify in-memory mutation implementation
 */

import { Mutasaurus } from '../mod.ts';

console.log("\n=== Testing In-Memory Mutations ===\n");

// Test 1: Run with in-memory mutations enabled
console.log("Test 1: Running mutation tests with in-memory mutations...\n");
const startInMemory = performance.now();

const mutasaurusInMemory = new Mutasaurus({
  sourceFiles: ['test/fixtures/*.ts'],
  testFiles: ['test/fixtures/*.test.ts'],
  timeout: 1_000,
  useInMemoryMutations: true,  // Enable in-memory mutations
  debug: false,
});

const resultInMemory = await mutasaurusInMemory.run(false);
const inMemoryTime = performance.now() - startInMemory;

console.log("\n=== In-Memory Mutations Results ===");
console.log(`Total Mutations: ${resultInMemory.totalMutations}`);
console.log(`Killed: ${resultInMemory.killedMutations}`);
console.log(`Type Errors: ${resultInMemory.typeErrorMutations}`);
console.log(`Survived: ${resultInMemory.survivedMutations}`);
console.log(`Timed Out: ${resultInMemory.timedOutMutations}`);
console.log(`Erroneous: ${resultInMemory.erroneousMutations}`);
console.log(`Total Time: ${inMemoryTime.toFixed(0)}ms\n`);

// Test 2: Run with ephemeral workers (original architecture)
console.log("Test 2: Running mutation tests with ephemeral workers...\n");
const startEphemeral = performance.now();

const mutasaurusEphemeral = new Mutasaurus({
  sourceFiles: ['test/fixtures/*.ts'],
  testFiles: ['test/fixtures/*.test.ts'],
  timeout: 1_000,
  useInMemoryMutations: false,  // Use original architecture
  debug: false,
});

const resultEphemeral = await mutasaurusEphemeral.run(false);
const ephemeralTime = performance.now() - startEphemeral;

console.log("\n=== Ephemeral Workers Results ===");
console.log(`Total Mutations: ${resultEphemeral.totalMutations}`);
console.log(`Killed: ${resultEphemeral.killedMutations}`);
console.log(`Type Errors: ${resultEphemeral.typeErrorMutations}`);
console.log(`Survived: ${resultEphemeral.survivedMutations}`);
console.log(`Timed Out: ${resultEphemeral.timedOutMutations}`);
console.log(`Erroneous: ${resultEphemeral.erroneousMutations}`);
console.log(`Total Time: ${ephemeralTime.toFixed(0)}ms\n`);

// Compare results
console.log("\n=== Comparison ===");
console.log(`Results Match: ${
  resultInMemory.totalMutations === resultEphemeral.totalMutations &&
  resultInMemory.killedMutations === resultEphemeral.killedMutations &&
  resultInMemory.typeErrorMutations === resultEphemeral.typeErrorMutations &&
  resultInMemory.survivedMutations === resultEphemeral.survivedMutations
    ? "✅ YES"
    : "❌ NO"
}`);

const speedup = ephemeralTime / inMemoryTime;
console.log(`Speedup: ${speedup.toFixed(2)}x ${speedup > 1 ? "🚀 FASTER" : "⚠️  SLOWER"}`);
console.log(`Time Saved: ${(ephemeralTime - inMemoryTime).toFixed(0)}ms\n`);

if (speedup < 1) {
  console.warn("⚠️  Warning: In-memory mutations are slower than ephemeral workers!");
  console.warn("This is unexpected. Check for issues in the implementation.");
}

if (
  resultInMemory.totalMutations !== resultEphemeral.totalMutations ||
  resultInMemory.killedMutations !== resultEphemeral.killedMutations ||
  resultInMemory.typeErrorMutations !== resultEphemeral.typeErrorMutations ||
  resultInMemory.survivedMutations !== resultEphemeral.survivedMutations
) {
  console.error("❌ ERROR: Results don't match between in-memory and ephemeral workers!");
  console.error("This indicates a bug in the in-memory mutation implementation.");
  Deno.exit(1);
}

console.log("✅ All tests passed!\n");
