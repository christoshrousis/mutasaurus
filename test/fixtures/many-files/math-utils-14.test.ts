import { assertEquals } from "@std/assert";
import { add14, subtract14, multiply14, divide14 } from "./math-utils-14.ts";

Deno.test("add14 should add two numbers", () => {
  assertEquals(add14(2, 3), 5);
  assertEquals(add14(10, 5), 15);
  assertEquals(add14(-1, 1), 0);
});

Deno.test("subtract14 should subtract two numbers", () => {
  assertEquals(subtract14(5, 3), 2);
  assertEquals(subtract14(10, 5), 5);
  assertEquals(subtract14(0, 1), -1);
});

Deno.test("multiply14 should multiply two numbers", () => {
  assertEquals(multiply14(2, 3), 6);
  assertEquals(multiply14(5, 4), 20);
  assertEquals(multiply14(0, 10), 0);
});

Deno.test("divide14 should divide two numbers", () => {
  assertEquals(divide14(6, 2), 3);
  assertEquals(divide14(10, 5), 2);
  assertEquals(divide14(9, 3), 3);
});
