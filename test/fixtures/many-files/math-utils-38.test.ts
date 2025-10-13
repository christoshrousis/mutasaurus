import { assertEquals } from "@std/assert";
import { add38, subtract38, multiply38, divide38 } from "./math-utils-38.ts";

Deno.test("add38 should add two numbers", () => {
  assertEquals(add38(2, 3), 5);
  assertEquals(add38(10, 5), 15);
  assertEquals(add38(-1, 1), 0);
});

Deno.test("subtract38 should subtract two numbers", () => {
  assertEquals(subtract38(5, 3), 2);
  assertEquals(subtract38(10, 5), 5);
  assertEquals(subtract38(0, 1), -1);
});

Deno.test("multiply38 should multiply two numbers", () => {
  assertEquals(multiply38(2, 3), 6);
  assertEquals(multiply38(5, 4), 20);
  assertEquals(multiply38(0, 10), 0);
});

Deno.test("divide38 should divide two numbers", () => {
  assertEquals(divide38(6, 2), 3);
  assertEquals(divide38(10, 5), 2);
  assertEquals(divide38(9, 3), 3);
});
