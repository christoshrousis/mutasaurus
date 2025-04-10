import { assertEquals } from '@std/assert';
import { multiply } from './multiplication.ts';

Deno.test('multiply', () => {
  const result = multiply(2, 6);
  assertEquals(result, 12);
});
