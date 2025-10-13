import { assertEquals } from "@std/assert";
import { add49, subtract49, multiply49, divide49 } from "./math-utils-49.ts";

Deno.test("add49 should add two numbers", () => {
  assertEquals(add49(2, 3), 5);
  assertEquals(add49(10, 5), 15);
  assertEquals(add49(-1, 1), 0);
});

Deno.test("subtract49 should subtract two numbers", () => {
  assertEquals(subtract49(5, 3), 2);
  assertEquals(subtract49(10, 5), 5);
  assertEquals(subtract49(0, 1), -1);
});

Deno.test("multiply49 should multiply two numbers", () => {
  assertEquals(multiply49(2, 3), 6);
  assertEquals(multiply49(5, 4), 20);
  assertEquals(multiply49(0, 10), 0);
});

Deno.test("divide49 should divide two numbers", () => {
  assertEquals(divide49(6, 2), 3);
  assertEquals(divide49(10, 5), 2);
  assertEquals(divide49(9, 3), 3);
});
