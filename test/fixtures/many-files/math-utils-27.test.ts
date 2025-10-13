import { assertEquals } from "@std/assert";
import { add27, subtract27, multiply27, divide27 } from "./math-utils-27.ts";

Deno.test("add27 should add two numbers", () => {
  assertEquals(add27(2, 3), 5);
  assertEquals(add27(10, 5), 15);
  assertEquals(add27(-1, 1), 0);
});

Deno.test("subtract27 should subtract two numbers", () => {
  assertEquals(subtract27(5, 3), 2);
  assertEquals(subtract27(10, 5), 5);
  assertEquals(subtract27(0, 1), -1);
});

Deno.test("multiply27 should multiply two numbers", () => {
  assertEquals(multiply27(2, 3), 6);
  assertEquals(multiply27(5, 4), 20);
  assertEquals(multiply27(0, 10), 0);
});

Deno.test("divide27 should divide two numbers", () => {
  assertEquals(divide27(6, 2), 3);
  assertEquals(divide27(10, 5), 2);
  assertEquals(divide27(9, 3), 3);
});
