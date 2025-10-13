import { assertEquals } from "@std/assert";
import { add04, subtract04, multiply04, divide04 } from "./math-utils-04.ts";

Deno.test("add04 should add two numbers", () => {
  assertEquals(add04(2, 3), 5);
  assertEquals(add04(10, 5), 15);
  assertEquals(add04(-1, 1), 0);
});

Deno.test("subtract04 should subtract two numbers", () => {
  assertEquals(subtract04(5, 3), 2);
  assertEquals(subtract04(10, 5), 5);
  assertEquals(subtract04(0, 1), -1);
});

Deno.test("multiply04 should multiply two numbers", () => {
  assertEquals(multiply04(2, 3), 6);
  assertEquals(multiply04(5, 4), 20);
  assertEquals(multiply04(0, 10), 0);
});

Deno.test("divide04 should divide two numbers", () => {
  assertEquals(divide04(6, 2), 3);
  assertEquals(divide04(10, 5), 2);
  assertEquals(divide04(9, 3), 3);
});
