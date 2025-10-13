import { assertEquals } from "@std/assert";
import { add09, subtract09, multiply09, divide09 } from "./math-utils-09.ts";

Deno.test("add09 should add two numbers", () => {
  assertEquals(add09(2, 3), 5);
  assertEquals(add09(10, 5), 15);
  assertEquals(add09(-1, 1), 0);
});

Deno.test("subtract09 should subtract two numbers", () => {
  assertEquals(subtract09(5, 3), 2);
  assertEquals(subtract09(10, 5), 5);
  assertEquals(subtract09(0, 1), -1);
});

Deno.test("multiply09 should multiply two numbers", () => {
  assertEquals(multiply09(2, 3), 6);
  assertEquals(multiply09(5, 4), 20);
  assertEquals(multiply09(0, 10), 0);
});

Deno.test("divide09 should divide two numbers", () => {
  assertEquals(divide09(6, 2), 3);
  assertEquals(divide09(10, 5), 2);
  assertEquals(divide09(9, 3), 3);
});
