import { assertEquals } from "@std/assert";

import { Mutasaurus } from '../mod.ts';


Deno.test("given a run with a configured working directory", async () => {
    const mutasaurus = new Mutasaurus({ workingDirectory: `${Deno.cwd()}/test/fixtures/sub-folder/`});
    const outcome = await mutasaurus.run(false);
  
    assertEquals(outcome.totalMutations, 1, "Total mutations should be 1");
    assertEquals(outcome.killedMutations, 1, "Killed mutations should be 1");
    assertEquals(outcome.survivedMutations, 0, "Survived mutations should be 0");
    assertEquals(outcome.timedOutMutations, 0, "Timed-out mutations should be 0");
    assertEquals(outcome.erroneousMutations, 0, "Erroneous mutations should be 0");
    assertEquals(outcome.typeErrorMutations, 0, "Type error mutations should be 0");
    assertEquals(outcome.incompleteMutations, 0, "Incomplete mutations should be 0");
  });
  