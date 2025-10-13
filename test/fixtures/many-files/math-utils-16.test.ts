import { assertEquals } from "@std/assert";
import { add16, subtract16, multiply16, divide16 } from "./math-utils-16.ts";

Deno.test("add16 should add two numbers", () => {
  assertEquals(add16(2, 3), 5);
  assertEquals(add16(10, 5), 15);
  assertEquals(add16(-1, 1), 0);
});

Deno.test("subtract16 should subtract two numbers", () => {
  assertEquals(subtract16(5, 3), 2);
  assertEquals(subtract16(10, 5), 5);
  assertEquals(subtract16(0, 1), -1);
});

Deno.test("multiply16 should multiply two numbers", () => {
  assertEquals(multiply16(2, 3), 6);
  assertEquals(multiply16(5, 4), 20);
  assertEquals(multiply16(0, 10), 0);
});

Deno.test("divide16 should divide two numbers", () => {
  assertEquals(divide16(6, 2), 3);
  assertEquals(divide16(10, 5), 2);
  assertEquals(divide16(9, 3), 3);
});
