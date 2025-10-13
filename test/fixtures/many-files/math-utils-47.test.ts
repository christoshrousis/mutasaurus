import { assertEquals } from "@std/assert";
import { add47, subtract47, multiply47, divide47 } from "./math-utils-47.ts";

Deno.test("add47 should add two numbers", () => {
  assertEquals(add47(2, 3), 5);
  assertEquals(add47(10, 5), 15);
  assertEquals(add47(-1, 1), 0);
});

Deno.test("subtract47 should subtract two numbers", () => {
  assertEquals(subtract47(5, 3), 2);
  assertEquals(subtract47(10, 5), 5);
  assertEquals(subtract47(0, 1), -1);
});

Deno.test("multiply47 should multiply two numbers", () => {
  assertEquals(multiply47(2, 3), 6);
  assertEquals(multiply47(5, 4), 20);
  assertEquals(multiply47(0, 10), 0);
});

Deno.test("divide47 should divide two numbers", () => {
  assertEquals(divide47(6, 2), 3);
  assertEquals(divide47(10, 5), 2);
  assertEquals(divide47(9, 3), 3);
});
