import { assertEquals } from "@std/assert";
import { add40, subtract40, multiply40, divide40 } from "./math-utils-40.ts";

Deno.test("add40 should add two numbers", () => {
  assertEquals(add40(2, 3), 5);
  assertEquals(add40(10, 5), 15);
  assertEquals(add40(-1, 1), 0);
});

Deno.test("subtract40 should subtract two numbers", () => {
  assertEquals(subtract40(5, 3), 2);
  assertEquals(subtract40(10, 5), 5);
  assertEquals(subtract40(0, 1), -1);
});

Deno.test("multiply40 should multiply two numbers", () => {
  assertEquals(multiply40(2, 3), 6);
  assertEquals(multiply40(5, 4), 20);
  assertEquals(multiply40(0, 10), 0);
});

Deno.test("divide40 should divide two numbers", () => {
  assertEquals(divide40(6, 2), 3);
  assertEquals(divide40(10, 5), 2);
  assertEquals(divide40(9, 3), 3);
});
