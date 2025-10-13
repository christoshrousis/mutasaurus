import { assertEquals } from "@std/assert";
import { add15, subtract15, multiply15, divide15 } from "./math-utils-15.ts";

Deno.test("add15 should add two numbers", () => {
  assertEquals(add15(2, 3), 5);
  assertEquals(add15(10, 5), 15);
  assertEquals(add15(-1, 1), 0);
});

Deno.test("subtract15 should subtract two numbers", () => {
  assertEquals(subtract15(5, 3), 2);
  assertEquals(subtract15(10, 5), 5);
  assertEquals(subtract15(0, 1), -1);
});

Deno.test("multiply15 should multiply two numbers", () => {
  assertEquals(multiply15(2, 3), 6);
  assertEquals(multiply15(5, 4), 20);
  assertEquals(multiply15(0, 10), 0);
});

Deno.test("divide15 should divide two numbers", () => {
  assertEquals(divide15(6, 2), 3);
  assertEquals(divide15(10, 5), 2);
  assertEquals(divide15(9, 3), 3);
});
