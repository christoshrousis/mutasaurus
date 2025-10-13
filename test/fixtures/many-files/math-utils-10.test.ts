import { assertEquals } from "@std/assert";
import { add10, subtract10, multiply10, divide10 } from "./math-utils-10.ts";

Deno.test("add10 should add two numbers", () => {
  assertEquals(add10(2, 3), 5);
  assertEquals(add10(10, 5), 15);
  assertEquals(add10(-1, 1), 0);
});

Deno.test("subtract10 should subtract two numbers", () => {
  assertEquals(subtract10(5, 3), 2);
  assertEquals(subtract10(10, 5), 5);
  assertEquals(subtract10(0, 1), -1);
});

Deno.test("multiply10 should multiply two numbers", () => {
  assertEquals(multiply10(2, 3), 6);
  assertEquals(multiply10(5, 4), 20);
  assertEquals(multiply10(0, 10), 0);
});

Deno.test("divide10 should divide two numbers", () => {
  assertEquals(divide10(6, 2), 3);
  assertEquals(divide10(10, 5), 2);
  assertEquals(divide10(9, 3), 3);
});
