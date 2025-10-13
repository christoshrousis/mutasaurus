import { assertEquals } from "@std/assert";
import { add30, subtract30, multiply30, divide30 } from "./math-utils-30.ts";

Deno.test("add30 should add two numbers", () => {
  assertEquals(add30(2, 3), 5);
  assertEquals(add30(10, 5), 15);
  assertEquals(add30(-1, 1), 0);
});

Deno.test("subtract30 should subtract two numbers", () => {
  assertEquals(subtract30(5, 3), 2);
  assertEquals(subtract30(10, 5), 5);
  assertEquals(subtract30(0, 1), -1);
});

Deno.test("multiply30 should multiply two numbers", () => {
  assertEquals(multiply30(2, 3), 6);
  assertEquals(multiply30(5, 4), 20);
  assertEquals(multiply30(0, 10), 0);
});

Deno.test("divide30 should divide two numbers", () => {
  assertEquals(divide30(6, 2), 3);
  assertEquals(divide30(10, 5), 2);
  assertEquals(divide30(9, 3), 3);
});
