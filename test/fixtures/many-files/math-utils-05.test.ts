import { assertEquals } from "@std/assert";
import { add05, subtract05, multiply05, divide05 } from "./math-utils-05.ts";

Deno.test("add05 should add two numbers", () => {
  assertEquals(add05(2, 3), 5);
  assertEquals(add05(10, 5), 15);
  assertEquals(add05(-1, 1), 0);
});

Deno.test("subtract05 should subtract two numbers", () => {
  assertEquals(subtract05(5, 3), 2);
  assertEquals(subtract05(10, 5), 5);
  assertEquals(subtract05(0, 1), -1);
});

Deno.test("multiply05 should multiply two numbers", () => {
  assertEquals(multiply05(2, 3), 6);
  assertEquals(multiply05(5, 4), 20);
  assertEquals(multiply05(0, 10), 0);
});

Deno.test("divide05 should divide two numbers", () => {
  assertEquals(divide05(6, 2), 3);
  assertEquals(divide05(10, 5), 2);
  assertEquals(divide05(9, 3), 3);
});
