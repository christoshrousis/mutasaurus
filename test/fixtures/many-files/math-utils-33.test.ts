import { assertEquals } from "@std/assert";
import { add33, subtract33, multiply33, divide33 } from "./math-utils-33.ts";

Deno.test("add33 should add two numbers", () => {
  assertEquals(add33(2, 3), 5);
  assertEquals(add33(10, 5), 15);
  assertEquals(add33(-1, 1), 0);
});

Deno.test("subtract33 should subtract two numbers", () => {
  assertEquals(subtract33(5, 3), 2);
  assertEquals(subtract33(10, 5), 5);
  assertEquals(subtract33(0, 1), -1);
});

Deno.test("multiply33 should multiply two numbers", () => {
  assertEquals(multiply33(2, 3), 6);
  assertEquals(multiply33(5, 4), 20);
  assertEquals(multiply33(0, 10), 0);
});

Deno.test("divide33 should divide two numbers", () => {
  assertEquals(divide33(6, 2), 3);
  assertEquals(divide33(10, 5), 2);
  assertEquals(divide33(9, 3), 3);
});
