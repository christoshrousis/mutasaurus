import { assertEquals } from "@std/assert";

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
  silent: true
});

const outcome = await mutasaurus.run(false);

Deno.test("given a non-exhaustive run, supplied with source and test files, should run the mutation testing process and return the expected outcome", async () => {
  assertEquals(outcome.totalMutations, 100, "Total mutations should be 100");
  assertEquals(outcome.killedMutations, 91, "Killed mutations should be 91");
  assertEquals(outcome.survivedMutations, 0, "Survived mutations should be 0");
  assertEquals(outcome.timedOutMutations, 8, "Timed-out mutations should be 8");
  assertEquals(outcome.erroneousMutations, 0, "Erroneous mutations should be 0");
  assertEquals(outcome.typeErrorMutations, 1, "Type error mutations should be 1");
  assertEquals(outcome.incompleteMutations, 0, "Incomplete mutations should be 0");
});

Deno.test("given a non-exhaustive run, given the configured timeout is exceeded, it's duration should match the configured timeout", async () => {
  const timedOutMutation = outcome.mutations.find(
    (mutation) => mutation.status === "timed-out",
  );
  assertEquals(timedOutMutation?.duration, 1_000, "It's duration should match the configured timeout");
});
