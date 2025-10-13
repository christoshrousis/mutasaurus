import { assertEquals } from "@std/assert";
import { add20, subtract20, multiply20, divide20 } from "./math-utils-20.ts";

Deno.test("add20 should add two numbers", () => {
  assertEquals(add20(2, 3), 5);
  assertEquals(add20(10, 5), 15);
  assertEquals(add20(-1, 1), 0);
});

Deno.test("subtract20 should subtract two numbers", () => {
  assertEquals(subtract20(5, 3), 2);
  assertEquals(subtract20(10, 5), 5);
  assertEquals(subtract20(0, 1), -1);
});

Deno.test("multiply20 should multiply two numbers", () => {
  assertEquals(multiply20(2, 3), 6);
  assertEquals(multiply20(5, 4), 20);
  assertEquals(multiply20(0, 10), 0);
});

Deno.test("divide20 should divide two numbers", () => {
  assertEquals(divide20(6, 2), 3);
  assertEquals(divide20(10, 5), 2);
  assertEquals(divide20(9, 3), 3);
});
