import { assertEquals } from "@std/assert";
import { add32, subtract32, multiply32, divide32 } from "./math-utils-32.ts";

Deno.test("add32 should add two numbers", () => {
  assertEquals(add32(2, 3), 5);
  assertEquals(add32(10, 5), 15);
  assertEquals(add32(-1, 1), 0);
});

Deno.test("subtract32 should subtract two numbers", () => {
  assertEquals(subtract32(5, 3), 2);
  assertEquals(subtract32(10, 5), 5);
  assertEquals(subtract32(0, 1), -1);
});

Deno.test("multiply32 should multiply two numbers", () => {
  assertEquals(multiply32(2, 3), 6);
  assertEquals(multiply32(5, 4), 20);
  assertEquals(multiply32(0, 10), 0);
});

Deno.test("divide32 should divide two numbers", () => {
  assertEquals(divide32(6, 2), 3);
  assertEquals(divide32(10, 5), 2);
  assertEquals(divide32(9, 3), 3);
});
