import { assertEquals } from "@std/assert";
import { add11, subtract11, multiply11, divide11 } from "./math-utils-11.ts";

Deno.test("add11 should add two numbers", () => {
  assertEquals(add11(2, 3), 5);
  assertEquals(add11(10, 5), 15);
  assertEquals(add11(-1, 1), 0);
});

Deno.test("subtract11 should subtract two numbers", () => {
  assertEquals(subtract11(5, 3), 2);
  assertEquals(subtract11(10, 5), 5);
  assertEquals(subtract11(0, 1), -1);
});

Deno.test("multiply11 should multiply two numbers", () => {
  assertEquals(multiply11(2, 3), 6);
  assertEquals(multiply11(5, 4), 20);
  assertEquals(multiply11(0, 10), 0);
});

Deno.test("divide11 should divide two numbers", () => {
  assertEquals(divide11(6, 2), 3);
  assertEquals(divide11(10, 5), 2);
  assertEquals(divide11(9, 3), 3);
});
