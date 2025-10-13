import { assertEquals } from "@std/assert";
import { add44, subtract44, multiply44, divide44 } from "./math-utils-44.ts";

Deno.test("add44 should add two numbers", () => {
  assertEquals(add44(2, 3), 5);
  assertEquals(add44(10, 5), 15);
  assertEquals(add44(-1, 1), 0);
});

Deno.test("subtract44 should subtract two numbers", () => {
  assertEquals(subtract44(5, 3), 2);
  assertEquals(subtract44(10, 5), 5);
  assertEquals(subtract44(0, 1), -1);
});

Deno.test("multiply44 should multiply two numbers", () => {
  assertEquals(multiply44(2, 3), 6);
  assertEquals(multiply44(5, 4), 20);
  assertEquals(multiply44(0, 10), 0);
});

Deno.test("divide44 should divide two numbers", () => {
  assertEquals(divide44(6, 2), 3);
  assertEquals(divide44(10, 5), 2);
  assertEquals(divide44(9, 3), 3);
});
