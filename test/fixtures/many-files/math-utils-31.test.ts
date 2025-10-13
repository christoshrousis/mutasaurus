import { assertEquals } from "@std/assert";
import { add31, subtract31, multiply31, divide31 } from "./math-utils-31.ts";

Deno.test("add31 should add two numbers", () => {
  assertEquals(add31(2, 3), 5);
  assertEquals(add31(10, 5), 15);
  assertEquals(add31(-1, 1), 0);
});

Deno.test("subtract31 should subtract two numbers", () => {
  assertEquals(subtract31(5, 3), 2);
  assertEquals(subtract31(10, 5), 5);
  assertEquals(subtract31(0, 1), -1);
});

Deno.test("multiply31 should multiply two numbers", () => {
  assertEquals(multiply31(2, 3), 6);
  assertEquals(multiply31(5, 4), 20);
  assertEquals(multiply31(0, 10), 0);
});

Deno.test("divide31 should divide two numbers", () => {
  assertEquals(divide31(6, 2), 3);
  assertEquals(divide31(10, 5), 2);
  assertEquals(divide31(9, 3), 3);
});
