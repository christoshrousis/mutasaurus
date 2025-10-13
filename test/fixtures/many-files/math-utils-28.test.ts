import { assertEquals } from "@std/assert";
import { add28, subtract28, multiply28, divide28 } from "./math-utils-28.ts";

Deno.test("add28 should add two numbers", () => {
  assertEquals(add28(2, 3), 5);
  assertEquals(add28(10, 5), 15);
  assertEquals(add28(-1, 1), 0);
});

Deno.test("subtract28 should subtract two numbers", () => {
  assertEquals(subtract28(5, 3), 2);
  assertEquals(subtract28(10, 5), 5);
  assertEquals(subtract28(0, 1), -1);
});

Deno.test("multiply28 should multiply two numbers", () => {
  assertEquals(multiply28(2, 3), 6);
  assertEquals(multiply28(5, 4), 20);
  assertEquals(multiply28(0, 10), 0);
});

Deno.test("divide28 should divide two numbers", () => {
  assertEquals(divide28(6, 2), 3);
  assertEquals(divide28(10, 5), 2);
  assertEquals(divide28(9, 3), 3);
});
