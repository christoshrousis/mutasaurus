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
    assertEquals(outcome.totalMutations, 32, "Total mutations should be 32");
    assertEquals(outcome.killedMutations, 7, "Killed mutations should be 7");
    assertEquals(outcome.survivedMutations, 24, "Survived mutations should be 24");
    assertEquals(outcome.timedOutMutations, 1, "Timed-out mutations should be 1");
    assertEquals(outcome.erroneousMutations, 0, "Erroneous mutations should be 0");
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
    assertEquals(outcome.totalMutations, 91, "Total mutations should be 91");
    assertEquals(outcome.killedMutations, 18, "Killed mutations should be 18");
    assertEquals(outcome.survivedMutations, 72, "Survived mutations should be 72");
    assertEquals(outcome.timedOutMutations, 1, "Timed-out mutations should be 1");
    assertEquals(outcome.erroneousMutations, 0, "Erroneous mutations should be 0");
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
})
