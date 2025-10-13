import { assertEquals } from "@std/assert";
import { add18, subtract18, multiply18, divide18 } from "./math-utils-18.ts";

Deno.test("add18 should add two numbers", () => {
  assertEquals(add18(2, 3), 5);
  assertEquals(add18(10, 5), 15);
  assertEquals(add18(-1, 1), 0);
});

Deno.test("subtract18 should subtract two numbers", () => {
  assertEquals(subtract18(5, 3), 2);
  assertEquals(subtract18(10, 5), 5);
  assertEquals(subtract18(0, 1), -1);
});

Deno.test("multiply18 should multiply two numbers", () => {
  assertEquals(multiply18(2, 3), 6);
  assertEquals(multiply18(5, 4), 20);
  assertEquals(multiply18(0, 10), 0);
});

Deno.test("divide18 should divide two numbers", () => {
  assertEquals(divide18(6, 2), 3);
  assertEquals(divide18(10, 5), 2);
  assertEquals(divide18(9, 3), 3);
});
