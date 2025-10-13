import { assertEquals } from "@std/assert";
import { add29, subtract29, multiply29, divide29 } from "./math-utils-29.ts";

Deno.test("add29 should add two numbers", () => {
  assertEquals(add29(2, 3), 5);
  assertEquals(add29(10, 5), 15);
  assertEquals(add29(-1, 1), 0);
});

Deno.test("subtract29 should subtract two numbers", () => {
  assertEquals(subtract29(5, 3), 2);
  assertEquals(subtract29(10, 5), 5);
  assertEquals(subtract29(0, 1), -1);
});

Deno.test("multiply29 should multiply two numbers", () => {
  assertEquals(multiply29(2, 3), 6);
  assertEquals(multiply29(5, 4), 20);
  assertEquals(multiply29(0, 10), 0);
});

Deno.test("divide29 should divide two numbers", () => {
  assertEquals(divide29(6, 2), 3);
  assertEquals(divide29(10, 5), 2);
  assertEquals(divide29(9, 3), 3);
});
