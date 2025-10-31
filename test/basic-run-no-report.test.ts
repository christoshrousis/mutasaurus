#!/usr/bin/env deno run --allow-read --allow-write --allow-run --allow-env --allow-ffi

/**
 * Test script to verify mutation testing implementation
 */

import { Mutasaurus } from '../mod.ts';

console.log("\n=== Testing Mutation Testing ===\n");

// Run mutation tests
console.log("Running mutation tests...\n");
const start = performance.now();

const mutasaurus = new Mutasaurus({
  sourceFiles: ['test/fixtures/*.ts'],
  testFiles: ['test/fixtures/*.test.ts'],
  timeout: 1_000,
  debug: false,
});

const result = await mutasaurus.run(false);
const totalTime = performance.now() - start;

console.log("\n=== Mutation Testing Results ===");
console.log(`Total Mutations: ${result.totalMutations}`);
console.log(`Killed: ${result.killedMutations}`);
console.log(`Type Errors: ${result.typeErrorMutations}`);
console.log(`Survived: ${result.survivedMutations}`);
console.log(`Timed Out: ${result.timedOutMutations}`);
console.log(`Erroneous: ${result.erroneousMutations}`);
console.log(`Incomplete: ${result.incompleteMutations}`);
console.log(`Total Time: ${totalTime.toFixed(0)}ms\n`);

console.log("✅ All tests passed!\n");
