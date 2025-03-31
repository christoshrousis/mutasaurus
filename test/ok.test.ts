import { assertEquals } from "@std/assert";

import { Mutasaurus } from '../mod.ts';

const mutasaurus = new Mutasaurus({
  sourceFiles: ['test/fixtures/*.ts'],
  testFiles: ['test/fixtures/*.test.ts'],
});

const outcome = await mutasaurus.run();

Deno.test("should run the mutation testing process", () => {
  assertEquals(outcome.totalMutations, 79, "Total mutations should be 79");
  assertEquals(outcome.killedMutations, 9, "Killed mutations should be 9");
  assertEquals(outcome.survivedMutations, 70, "Survived mutations should be 70");
});
