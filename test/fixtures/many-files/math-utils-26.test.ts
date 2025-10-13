import { assertEquals } from "@std/assert";
import { add26, subtract26, multiply26, divide26 } from "./math-utils-26.ts";

Deno.test("add26 should add two numbers", () => {
  assertEquals(add26(2, 3), 5);
  assertEquals(add26(10, 5), 15);
  assertEquals(add26(-1, 1), 0);
});

Deno.test("subtract26 should subtract two numbers", () => {
  assertEquals(subtract26(5, 3), 2);
  assertEquals(subtract26(10, 5), 5);
  assertEquals(subtract26(0, 1), -1);
});

Deno.test("multiply26 should multiply two numbers", () => {
  assertEquals(multiply26(2, 3), 6);
  assertEquals(multiply26(5, 4), 20);
  assertEquals(multiply26(0, 10), 0);
});

Deno.test("divide26 should divide two numbers", () => {
  assertEquals(divide26(6, 2), 3);
  assertEquals(divide26(10, 5), 2);
  assertEquals(divide26(9, 3), 3);
});
