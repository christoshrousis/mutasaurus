import { assertEquals } from "@std/assert";
import { add01, subtract01, multiply01, divide01 } from "./math-utils-01.ts";

Deno.test("add01 should add two numbers", () => {
  assertEquals(add01(2, 3), 5);
  assertEquals(add01(10, 5), 15);
  assertEquals(add01(-1, 1), 0);
});

Deno.test("subtract01 should subtract two numbers", () => {
  assertEquals(subtract01(5, 3), 2);
  assertEquals(subtract01(10, 5), 5);
  assertEquals(subtract01(0, 1), -1);
});

Deno.test("multiply01 should multiply two numbers", () => {
  assertEquals(multiply01(2, 3), 6);
  assertEquals(multiply01(5, 4), 20);
  assertEquals(multiply01(0, 10), 0);
});

Deno.test("divide01 should divide two numbers", () => {
  assertEquals(divide01(6, 2), 3);
  assertEquals(divide01(10, 5), 2);
  assertEquals(divide01(9, 3), 3);
});
