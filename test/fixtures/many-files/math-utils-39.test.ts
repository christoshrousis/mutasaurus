import { assertEquals } from "@std/assert";
import { add39, subtract39, multiply39, divide39 } from "./math-utils-39.ts";

Deno.test("add39 should add two numbers", () => {
  assertEquals(add39(2, 3), 5);
  assertEquals(add39(10, 5), 15);
  assertEquals(add39(-1, 1), 0);
});

Deno.test("subtract39 should subtract two numbers", () => {
  assertEquals(subtract39(5, 3), 2);
  assertEquals(subtract39(10, 5), 5);
  assertEquals(subtract39(0, 1), -1);
});

Deno.test("multiply39 should multiply two numbers", () => {
  assertEquals(multiply39(2, 3), 6);
  assertEquals(multiply39(5, 4), 20);
  assertEquals(multiply39(0, 10), 0);
});

Deno.test("divide39 should divide two numbers", () => {
  assertEquals(divide39(6, 2), 3);
  assertEquals(divide39(10, 5), 2);
  assertEquals(divide39(9, 3), 3);
});
