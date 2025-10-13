import { assertEquals } from "@std/assert";
import { add23, subtract23, multiply23, divide23 } from "./math-utils-23.ts";

Deno.test("add23 should add two numbers", () => {
  assertEquals(add23(2, 3), 5);
  assertEquals(add23(10, 5), 15);
  assertEquals(add23(-1, 1), 0);
});

Deno.test("subtract23 should subtract two numbers", () => {
  assertEquals(subtract23(5, 3), 2);
  assertEquals(subtract23(10, 5), 5);
  assertEquals(subtract23(0, 1), -1);
});

Deno.test("multiply23 should multiply two numbers", () => {
  assertEquals(multiply23(2, 3), 6);
  assertEquals(multiply23(5, 4), 20);
  assertEquals(multiply23(0, 10), 0);
});

Deno.test("divide23 should divide two numbers", () => {
  assertEquals(divide23(6, 2), 3);
  assertEquals(divide23(10, 5), 2);
  assertEquals(divide23(9, 3), 3);
});
