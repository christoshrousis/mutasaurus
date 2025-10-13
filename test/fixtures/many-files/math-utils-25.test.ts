import { assertEquals } from "@std/assert";
import { add25, subtract25, multiply25, divide25 } from "./math-utils-25.ts";

Deno.test("add25 should add two numbers", () => {
  assertEquals(add25(2, 3), 5);
  assertEquals(add25(10, 5), 15);
  assertEquals(add25(-1, 1), 0);
});

Deno.test("subtract25 should subtract two numbers", () => {
  assertEquals(subtract25(5, 3), 2);
  assertEquals(subtract25(10, 5), 5);
  assertEquals(subtract25(0, 1), -1);
});

Deno.test("multiply25 should multiply two numbers", () => {
  assertEquals(multiply25(2, 3), 6);
  assertEquals(multiply25(5, 4), 20);
  assertEquals(multiply25(0, 10), 0);
});

Deno.test("divide25 should divide two numbers", () => {
  assertEquals(divide25(6, 2), 3);
  assertEquals(divide25(10, 5), 2);
  assertEquals(divide25(9, 3), 3);
});
