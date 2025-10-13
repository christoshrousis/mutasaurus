import { assertEquals } from "@std/assert";
import { add07, subtract07, multiply07, divide07 } from "./math-utils-07.ts";

Deno.test("add07 should add two numbers", () => {
  assertEquals(add07(2, 3), 5);
  assertEquals(add07(10, 5), 15);
  assertEquals(add07(-1, 1), 0);
});

Deno.test("subtract07 should subtract two numbers", () => {
  assertEquals(subtract07(5, 3), 2);
  assertEquals(subtract07(10, 5), 5);
  assertEquals(subtract07(0, 1), -1);
});

Deno.test("multiply07 should multiply two numbers", () => {
  assertEquals(multiply07(2, 3), 6);
  assertEquals(multiply07(5, 4), 20);
  assertEquals(multiply07(0, 10), 0);
});

Deno.test("divide07 should divide two numbers", () => {
  assertEquals(divide07(6, 2), 3);
  assertEquals(divide07(10, 5), 2);
  assertEquals(divide07(9, 3), 3);
});
