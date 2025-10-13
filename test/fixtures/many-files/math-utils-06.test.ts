import { assertEquals } from "@std/assert";
import { add06, subtract06, multiply06, divide06 } from "./math-utils-06.ts";

Deno.test("add06 should add two numbers", () => {
  assertEquals(add06(2, 3), 5);
  assertEquals(add06(10, 5), 15);
  assertEquals(add06(-1, 1), 0);
});

Deno.test("subtract06 should subtract two numbers", () => {
  assertEquals(subtract06(5, 3), 2);
  assertEquals(subtract06(10, 5), 5);
  assertEquals(subtract06(0, 1), -1);
});

Deno.test("multiply06 should multiply two numbers", () => {
  assertEquals(multiply06(2, 3), 6);
  assertEquals(multiply06(5, 4), 20);
  assertEquals(multiply06(0, 10), 0);
});

Deno.test("divide06 should divide two numbers", () => {
  assertEquals(divide06(6, 2), 3);
  assertEquals(divide06(10, 5), 2);
  assertEquals(divide06(9, 3), 3);
});
