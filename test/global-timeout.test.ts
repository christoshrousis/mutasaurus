import { assert, assertEquals } from "@std/assert";

import { Mutasaurus } from '../mod.ts';

const mutasaurus = new Mutasaurus({
  sourceFiles: [
    'test/fixtures/chained-expression.ts',
    'test/fixtures/compound-calculation.ts',
    'test/fixtures/nested-expression.ts',
    'test/fixtures/one-big-file.ts',
    'test/fixtures/simple-expression-assignment.ts',
    'test/fixtures/simple-expression-binary.ts',
    'test/fixtures/timeout-prone-calculation.ts',
    'test/fixtures/type-safe-calculation.ts',
  ],
  testFiles: [
    'test/fixtures/one-big-file.test.ts',
    'test/fixtures/sum-cross-coverage.test.ts',
    'test/fixtures/sums.test.ts',
    'test/fixtures/timeout-prone.test.ts',
    'test/fixtures/type-safe-calculation.test.ts',
  ],
  timeout: 1_000,
  globalTimeout: 3_000,
  silent: true
});

const outcome = await mutasaurus.run(false);

Deno.test("given a global timeout below total run time, should end quickly and flag timeout", () => {
  assert(outcome.globalTimeoutHit === true, "Global timeout should be reported as hit");
  // Allow a small buffer over the configured 3s for graceful shutdown and processing
  assert(outcome.totalTime <= 5_500, `Run should complete quickly after global timeout; took ${outcome.totalTime}ms`);
});

Deno.test("given a global timeout below total run time, should mark some mutations as incomplete", () => {
  assert(outcome.incompleteMutations > 0, "Some mutations should be marked as incomplete");
  assert(outcome.incompleteMutations < outcome.totalMutations, "Not all mutations should be incomplete");
  // Sanity check: other buckets still exist
  assertEquals(outcome.totalMutations, outcome.mutations.length, "Mutation counts should align");
});


