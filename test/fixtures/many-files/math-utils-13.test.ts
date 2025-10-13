import { assertEquals } from "@std/assert";
import { add13, subtract13, multiply13, divide13 } from "./math-utils-13.ts";

Deno.test("add13 should add two numbers", () => {
  assertEquals(add13(2, 3), 5);
  assertEquals(add13(10, 5), 15);
  assertEquals(add13(-1, 1), 0);
});

Deno.test("subtract13 should subtract two numbers", () => {
  assertEquals(subtract13(5, 3), 2);
  assertEquals(subtract13(10, 5), 5);
  assertEquals(subtract13(0, 1), -1);
});

Deno.test("multiply13 should multiply two numbers", () => {
  assertEquals(multiply13(2, 3), 6);
  assertEquals(multiply13(5, 4), 20);
  assertEquals(multiply13(0, 10), 0);
});

Deno.test("divide13 should divide two numbers", () => {
  assertEquals(divide13(6, 2), 3);
  assertEquals(divide13(10, 5), 2);
  assertEquals(divide13(9, 3), 3);
});
