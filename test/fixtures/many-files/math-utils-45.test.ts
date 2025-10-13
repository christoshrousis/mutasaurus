import { assertEquals } from "@std/assert";
import { add45, subtract45, multiply45, divide45 } from "./math-utils-45.ts";

Deno.test("add45 should add two numbers", () => {
  assertEquals(add45(2, 3), 5);
  assertEquals(add45(10, 5), 15);
  assertEquals(add45(-1, 1), 0);
});

Deno.test("subtract45 should subtract two numbers", () => {
  assertEquals(subtract45(5, 3), 2);
  assertEquals(subtract45(10, 5), 5);
  assertEquals(subtract45(0, 1), -1);
});

Deno.test("multiply45 should multiply two numbers", () => {
  assertEquals(multiply45(2, 3), 6);
  assertEquals(multiply45(5, 4), 20);
  assertEquals(multiply45(0, 10), 0);
});

Deno.test("divide45 should divide two numbers", () => {
  assertEquals(divide45(6, 2), 3);
  assertEquals(divide45(10, 5), 2);
  assertEquals(divide45(9, 3), 3);
});
