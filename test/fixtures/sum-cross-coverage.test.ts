import { assertEquals } from '@std/assert';
import { sum } from './simple-expression-binary.ts';

Deno.test('sum', () => {
  const result = sum(3, 4);
  assertEquals(result, 5);
});
