import { assertEquals } from "@std/assert";
import { add36, subtract36, multiply36, divide36 } from "./math-utils-36.ts";

Deno.test("add36 should add two numbers", () => {
  assertEquals(add36(2, 3), 5);
  assertEquals(add36(10, 5), 15);
  assertEquals(add36(-1, 1), 0);
});

Deno.test("subtract36 should subtract two numbers", () => {
  assertEquals(subtract36(5, 3), 2);
  assertEquals(subtract36(10, 5), 5);
  assertEquals(subtract36(0, 1), -1);
});

Deno.test("multiply36 should multiply two numbers", () => {
  assertEquals(multiply36(2, 3), 6);
  assertEquals(multiply36(5, 4), 20);
  assertEquals(multiply36(0, 10), 0);
});

Deno.test("divide36 should divide two numbers", () => {
  assertEquals(divide36(6, 2), 3);
  assertEquals(divide36(10, 5), 2);
  assertEquals(divide36(9, 3), 3);
});
