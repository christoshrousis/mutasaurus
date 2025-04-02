import { assertEquals } from "@std/assert";
import { calcCRC } from "./timeout-prone-calculation.ts";

Deno.test("calcCRC() with empty buffer", () => {
  assertEquals(calcCRC(new Uint8Array(0)), 0);
});

Deno.test('calcCRC() with "Hello World"', () => {
  assertEquals(calcCRC(new TextEncoder().encode("Hello World")), 0x4a17b156);
});
