import { assertEquals } from "@std/assert";
import { add21, subtract21, multiply21, divide21 } from "./math-utils-21.ts";

Deno.test("add21 should add two numbers", () => {
  assertEquals(add21(2, 3), 5);
  assertEquals(add21(10, 5), 15);
  assertEquals(add21(-1, 1), 0);
});

Deno.test("subtract21 should subtract two numbers", () => {
  assertEquals(subtract21(5, 3), 2);
  assertEquals(subtract21(10, 5), 5);
  assertEquals(subtract21(0, 1), -1);
});

Deno.test("multiply21 should multiply two numbers", () => {
  assertEquals(multiply21(2, 3), 6);
  assertEquals(multiply21(5, 4), 20);
  assertEquals(multiply21(0, 10), 0);
});

Deno.test("divide21 should divide two numbers", () => {
  assertEquals(divide21(6, 2), 3);
  assertEquals(divide21(10, 5), 2);
  assertEquals(divide21(9, 3), 3);
});
