import { assertEquals } from "@std/assert";

import { Mutasaurus } from '../mod.ts';

Deno.test("given an exhaustive run, supplied with source and test files, should run the mutation testing process and return the expected outcome", async () => {
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
      exhaustiveMode: true,
      silent: true
    });
  
    const outcome = await mutasaurus.run(false);

    assertEquals(outcome.totalMutations, 280, "Total mutations should be 280");
    assertEquals(outcome.killedMutations, 231, "Killed mutations should be 231");
    assertEquals(outcome.survivedMutations, 31, "Survived mutations should be 31");
    assertEquals(outcome.timedOutMutations, 17, "Timed-out mutations should be 17");
    assertEquals(outcome.erroneousMutations, 0, "Erroneous mutations should be 0");
    assertEquals(outcome.typeErrorMutations, 1, "Type error mutations should be 1");
    assertEquals(outcome.incompleteMutations, 0, "Incomplete mutations should be 0");
  });
  