import { assertEquals } from "@std/assert";
import { add43, subtract43, multiply43, divide43 } from "./math-utils-43.ts";

Deno.test("add43 should add two numbers", () => {
  assertEquals(add43(2, 3), 5);
  assertEquals(add43(10, 5), 15);
  assertEquals(add43(-1, 1), 0);
});

Deno.test("subtract43 should subtract two numbers", () => {
  assertEquals(subtract43(5, 3), 2);
  assertEquals(subtract43(10, 5), 5);
  assertEquals(subtract43(0, 1), -1);
});

Deno.test("multiply43 should multiply two numbers", () => {
  assertEquals(multiply43(2, 3), 6);
  assertEquals(multiply43(5, 4), 20);
  assertEquals(multiply43(0, 10), 0);
});

Deno.test("divide43 should divide two numbers", () => {
  assertEquals(divide43(6, 2), 3);
  assertEquals(divide43(10, 5), 2);
  assertEquals(divide43(9, 3), 3);
});
