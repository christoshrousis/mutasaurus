import { assertEquals } from "@std/assert";
import { add34, subtract34, multiply34, divide34 } from "./math-utils-34.ts";

Deno.test("add34 should add two numbers", () => {
  assertEquals(add34(2, 3), 5);
  assertEquals(add34(10, 5), 15);
  assertEquals(add34(-1, 1), 0);
});

Deno.test("subtract34 should subtract two numbers", () => {
  assertEquals(subtract34(5, 3), 2);
  assertEquals(subtract34(10, 5), 5);
  assertEquals(subtract34(0, 1), -1);
});

Deno.test("multiply34 should multiply two numbers", () => {
  assertEquals(multiply34(2, 3), 6);
  assertEquals(multiply34(5, 4), 20);
  assertEquals(multiply34(0, 10), 0);
});

Deno.test("divide34 should divide two numbers", () => {
  assertEquals(divide34(6, 2), 3);
  assertEquals(divide34(10, 5), 2);
  assertEquals(divide34(9, 3), 3);
});
