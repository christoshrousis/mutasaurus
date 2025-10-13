import { assertEquals } from "@std/assert";
import { add50, subtract50, multiply50, divide50 } from "./math-utils-50.ts";

Deno.test("add50 should add two numbers", () => {
  assertEquals(add50(2, 3), 5);
  assertEquals(add50(10, 5), 15);
  assertEquals(add50(-1, 1), 0);
});

Deno.test("subtract50 should subtract two numbers", () => {
  assertEquals(subtract50(5, 3), 2);
  assertEquals(subtract50(10, 5), 5);
  assertEquals(subtract50(0, 1), -1);
});

Deno.test("multiply50 should multiply two numbers", () => {
  assertEquals(multiply50(2, 3), 6);
  assertEquals(multiply50(5, 4), 20);
  assertEquals(multiply50(0, 10), 0);
});

Deno.test("divide50 should divide two numbers", () => {
  assertEquals(divide50(6, 2), 3);
  assertEquals(divide50(10, 5), 2);
  assertEquals(divide50(9, 3), 3);
});
