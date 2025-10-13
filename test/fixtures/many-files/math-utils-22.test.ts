import { assertEquals } from "@std/assert";
import { add22, subtract22, multiply22, divide22 } from "./math-utils-22.ts";

Deno.test("add22 should add two numbers", () => {
  assertEquals(add22(2, 3), 5);
  assertEquals(add22(10, 5), 15);
  assertEquals(add22(-1, 1), 0);
});

Deno.test("subtract22 should subtract two numbers", () => {
  assertEquals(subtract22(5, 3), 2);
  assertEquals(subtract22(10, 5), 5);
  assertEquals(subtract22(0, 1), -1);
});

Deno.test("multiply22 should multiply two numbers", () => {
  assertEquals(multiply22(2, 3), 6);
  assertEquals(multiply22(5, 4), 20);
  assertEquals(multiply22(0, 10), 0);
});

Deno.test("divide22 should divide two numbers", () => {
  assertEquals(divide22(6, 2), 3);
  assertEquals(divide22(10, 5), 2);
  assertEquals(divide22(9, 3), 3);
});
