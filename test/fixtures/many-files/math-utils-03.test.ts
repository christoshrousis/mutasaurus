import { assertEquals } from "@std/assert";
import { add03, subtract03, multiply03, divide03 } from "./math-utils-03.ts";

Deno.test("add03 should add two numbers", () => {
  assertEquals(add03(2, 3), 5);
  assertEquals(add03(10, 5), 15);
  assertEquals(add03(-1, 1), 0);
});

Deno.test("subtract03 should subtract two numbers", () => {
  assertEquals(subtract03(5, 3), 2);
  assertEquals(subtract03(10, 5), 5);
  assertEquals(subtract03(0, 1), -1);
});

Deno.test("multiply03 should multiply two numbers", () => {
  assertEquals(multiply03(2, 3), 6);
  assertEquals(multiply03(5, 4), 20);
  assertEquals(multiply03(0, 10), 0);
});

Deno.test("divide03 should divide two numbers", () => {
  assertEquals(divide03(6, 2), 3);
  assertEquals(divide03(10, 5), 2);
  assertEquals(divide03(9, 3), 3);
});
