import { assertEquals } from "@std/assert";
import { add37, subtract37, multiply37, divide37 } from "./math-utils-37.ts";

Deno.test("add37 should add two numbers", () => {
  assertEquals(add37(2, 3), 5);
  assertEquals(add37(10, 5), 15);
  assertEquals(add37(-1, 1), 0);
});

Deno.test("subtract37 should subtract two numbers", () => {
  assertEquals(subtract37(5, 3), 2);
  assertEquals(subtract37(10, 5), 5);
  assertEquals(subtract37(0, 1), -1);
});

Deno.test("multiply37 should multiply two numbers", () => {
  assertEquals(multiply37(2, 3), 6);
  assertEquals(multiply37(5, 4), 20);
  assertEquals(multiply37(0, 10), 0);
});

Deno.test("divide37 should divide two numbers", () => {
  assertEquals(divide37(6, 2), 3);
  assertEquals(divide37(10, 5), 2);
  assertEquals(divide37(9, 3), 3);
});
