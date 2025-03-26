import { assertEquals } from '@std/assert';
import { sum } from './simple-expression-binary.ts';
import { sum as chainedSum } from './chained-expression.ts';

Deno.test('sum', () => {
  const result = sum(1, 2);
  assertEquals(result, 3);
});

Deno.test('chained-sum', () => {
  const result = chainedSum(2, 3, 5);
  assertEquals(result, 10);
});
