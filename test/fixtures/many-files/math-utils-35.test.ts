import { assertEquals } from "@std/assert";
import { add35, subtract35, multiply35, divide35 } from "./math-utils-35.ts";

Deno.test("add35 should add two numbers", () => {
  assertEquals(add35(2, 3), 5);
  assertEquals(add35(10, 5), 15);
  assertEquals(add35(-1, 1), 0);
});

Deno.test("subtract35 should subtract two numbers", () => {
  assertEquals(subtract35(5, 3), 2);
  assertEquals(subtract35(10, 5), 5);
  assertEquals(subtract35(0, 1), -1);
});

Deno.test("multiply35 should multiply two numbers", () => {
  assertEquals(multiply35(2, 3), 6);
  assertEquals(multiply35(5, 4), 20);
  assertEquals(multiply35(0, 10), 0);
});

Deno.test("divide35 should divide two numbers", () => {
  assertEquals(divide35(6, 2), 3);
  assertEquals(divide35(10, 5), 2);
  assertEquals(divide35(9, 3), 3);
});
