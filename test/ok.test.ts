import { assertEquals } from "@std/assert";

import { Mutasaurus } from '../mod.ts';

const mutasaurus = new Mutasaurus({
  sourceFiles: ['test/fixtures/*.ts'],
  testFiles: ['test/fixtures/*.test.ts'],
  timeout: 1_000,
});

const outcome = await mutasaurus.run();

Deno.test("should run the mutation testing process, and return the expected outcome", () => {
  assertEquals(outcome.totalMutations, 91, "Total mutations should be 91");
  assertEquals(outcome.killedMutations, 18, "Killed mutations should be 18");
  assertEquals(outcome.survivedMutations, 72, "Survived mutations should be 72");
  assertEquals(outcome.timedOutMutations, 1, "Timed-out mutations should be 1");
  assertEquals(outcome.erroneousMutations, 0, "Erroneous mutations should be 0");
});

Deno.test("given the configured timeout is exceeded", () => {
  const timedOutMutation = outcome.mutations.find(
    (mutation) => mutation.status === "timed-out",
  );
  assertEquals(timedOutMutation?.duration, 1_000, "It's duration should match the configured timeout");
});
