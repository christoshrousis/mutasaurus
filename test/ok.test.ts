import { assertEquals } from "@std/assert";

import { Mutasaurus } from '../mod.ts';

Deno.test("given a non-exhaustive run, supplied with source and test files", async () => {
  const mutasaurus = new Mutasaurus({
    sourceFiles: ['test/fixtures/*.ts'],
    testFiles: ['test/fixtures/*.test.ts'],
    timeout: 1_000,
  });

  const outcome = await mutasaurus.run(false);

  Deno.test("should run the mutation testing process, and return the expected outcome", () => {
    assertEquals(outcome.totalMutations, 13, "Total mutations should be 13");
    assertEquals(outcome.killedMutations, 11, "Killed mutations should be 11");
    assertEquals(outcome.survivedMutations, 0, "Survived mutations should be 0");
    assertEquals(outcome.timedOutMutations, 1, "Timed-out mutations should be 1");
    assertEquals(outcome.erroneousMutations, 0, "Erroneous mutations should be 0");
    assertEquals(outcome.typeErrorMutations, 1, "Type error mutations should be 1");
  });

  Deno.test("given the configured timeout is exceeded", () => {
    const timedOutMutation = outcome.mutations.find(
      (mutation) => mutation.status === "timed-out",
    );
    assertEquals(timedOutMutation?.duration, 1_000, "It's duration should match the configured timeout");
  });
})

Deno.test("given an exhaustive run, supplied with source and test files", async () => {
  const mutasaurus = new Mutasaurus({
    sourceFiles: ['test/fixtures/*.ts'],
    testFiles: ['test/fixtures/*.test.ts'],
    timeout: 1_000,
    exhaustiveMode: true,
  });

  const outcome = await mutasaurus.run(false);

  Deno.test("should run the mutation testing process, and return the expected outcome", () => {
    assertEquals(outcome.totalMutations, 33, "Total mutations should be 33");
    assertEquals(outcome.killedMutations, 30, "Killed mutations should be 30");
    assertEquals(outcome.survivedMutations, 1, "Survived mutations should be 1");
    assertEquals(outcome.timedOutMutations, 1, "Timed-out mutations should be 1");
    assertEquals(outcome.erroneousMutations, 0, "Erroneous mutations should be 0");
    assertEquals(outcome.typeErrorMutations, 1, "Type error mutations should be 1");
  });
})

Deno.test("given a run with a configured working directory", async () => {
  const mutasaurus = new Mutasaurus({ workingDirectory: `${Deno.cwd()}/test/fixtures/sub-folder/`});
  const outcome = await mutasaurus.run(false);

  assertEquals(outcome.totalMutations, 1, "Total mutations should be 1");
  assertEquals(outcome.killedMutations, 1, "Killed mutations should be 1");
  assertEquals(outcome.survivedMutations, 0, "Survived mutations should be 0");
  assertEquals(outcome.timedOutMutations, 0, "Timed-out mutations should be 0");
  assertEquals(outcome.erroneousMutations, 0, "Erroneous mutations should be 0");
  assertEquals(outcome.typeErrorMutations, 0, "Type error mutations should be 0");
})
