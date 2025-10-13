#!/usr/bin/env deno run --allow-read --allow-write --allow-run --allow-env --allow-ffi

/**
 * Test script to verify persistent worker pool implementation
 */

import { Mutasaurus } from '../mod.ts';

console.log("\n=== Testing Persistent Worker Pool ===\n");

// Test 1: Run with persistent workers enabled
console.log("Test 1: Running mutation tests with persistent workers...\n");
const startPersistent = performance.now();

const mutasaurusPersistent = new Mutasaurus({
  sourceFiles: ['test/fixtures/*.ts'],
  testFiles: ['test/fixtures/*.test.ts'],
  timeout: 1_000,
  usePersistentWorkers: true,  // Enable persistent workers
  debug: false,
});

const resultPersistent = await mutasaurusPersistent.run(false);
const persistentTime = performance.now() - startPersistent;

console.log("\n=== Persistent Workers Results ===");
console.log(`Total Mutations: ${resultPersistent.totalMutations}`);
console.log(`Killed: ${resultPersistent.killedMutations}`);
console.log(`Type Errors: ${resultPersistent.typeErrorMutations}`);
console.log(`Survived: ${resultPersistent.survivedMutations}`);
console.log(`Timed Out: ${resultPersistent.timedOutMutations}`);
console.log(`Erroneous: ${resultPersistent.erroneousMutations}`);
console.log(`Total Time: ${persistentTime.toFixed(0)}ms\n`);

// Test 2: Run with ephemeral workers (original architecture)
console.log("Test 2: Running mutation tests with ephemeral workers...\n");
const startEphemeral = performance.now();

const mutasaurusEphemeral = new Mutasaurus({
  sourceFiles: ['test/fixtures/*.ts'],
  testFiles: ['test/fixtures/*.test.ts'],
  timeout: 1_000,
  usePersistentWorkers: false,  // Use original architecture
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
  resultPersistent.totalMutations === resultEphemeral.totalMutations &&
  resultPersistent.killedMutations === resultEphemeral.killedMutations &&
  resultPersistent.typeErrorMutations === resultEphemeral.typeErrorMutations &&
  resultPersistent.survivedMutations === resultEphemeral.survivedMutations
    ? "✅ YES"
    : "❌ NO"
}`);

const speedup = ephemeralTime / persistentTime;
console.log(`Speedup: ${speedup.toFixed(2)}x ${speedup > 1 ? "🚀 FASTER" : "⚠️  SLOWER"}`);
console.log(`Time Saved: ${(ephemeralTime - persistentTime).toFixed(0)}ms\n`);

if (speedup < 1) {
  console.warn("⚠️  Warning: Persistent workers are slower than ephemeral workers!");
  console.warn("This is unexpected. Check for issues in the implementation.");
}

if (
  resultPersistent.totalMutations !== resultEphemeral.totalMutations ||
  resultPersistent.killedMutations !== resultEphemeral.killedMutations ||
  resultPersistent.typeErrorMutations !== resultEphemeral.typeErrorMutations ||
  resultPersistent.survivedMutations !== resultEphemeral.survivedMutations
) {
  console.error("❌ ERROR: Results don't match between persistent and ephemeral workers!");
  console.error("This indicates a bug in the persistent worker implementation.");
  Deno.exit(1);
}

console.log("✅ All tests passed!\n");
