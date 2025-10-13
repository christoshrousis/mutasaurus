import { assertEquals } from "@std/assert";
import { add24, subtract24, multiply24, divide24 } from "./math-utils-24.ts";

Deno.test("add24 should add two numbers", () => {
  assertEquals(add24(2, 3), 5);
  assertEquals(add24(10, 5), 15);
  assertEquals(add24(-1, 1), 0);
});

Deno.test("subtract24 should subtract two numbers", () => {
  assertEquals(subtract24(5, 3), 2);
  assertEquals(subtract24(10, 5), 5);
  assertEquals(subtract24(0, 1), -1);
});

Deno.test("multiply24 should multiply two numbers", () => {
  assertEquals(multiply24(2, 3), 6);
  assertEquals(multiply24(5, 4), 20);
  assertEquals(multiply24(0, 10), 0);
});

Deno.test("divide24 should divide two numbers", () => {
  assertEquals(divide24(6, 2), 3);
  assertEquals(divide24(10, 5), 2);
  assertEquals(divide24(9, 3), 3);
});
