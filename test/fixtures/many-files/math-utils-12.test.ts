import { assertEquals } from "@std/assert";
import { add12, subtract12, multiply12, divide12 } from "./math-utils-12.ts";

Deno.test("add12 should add two numbers", () => {
  assertEquals(add12(2, 3), 5);
  assertEquals(add12(10, 5), 15);
  assertEquals(add12(-1, 1), 0);
});

Deno.test("subtract12 should subtract two numbers", () => {
  assertEquals(subtract12(5, 3), 2);
  assertEquals(subtract12(10, 5), 5);
  assertEquals(subtract12(0, 1), -1);
});

Deno.test("multiply12 should multiply two numbers", () => {
  assertEquals(multiply12(2, 3), 6);
  assertEquals(multiply12(5, 4), 20);
  assertEquals(multiply12(0, 10), 0);
});

Deno.test("divide12 should divide two numbers", () => {
  assertEquals(divide12(6, 2), 3);
  assertEquals(divide12(10, 5), 2);
  assertEquals(divide12(9, 3), 3);
});
