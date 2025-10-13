import { assertEquals } from "@std/assert";
import { add19, subtract19, multiply19, divide19 } from "./math-utils-19.ts";

Deno.test("add19 should add two numbers", () => {
  assertEquals(add19(2, 3), 5);
  assertEquals(add19(10, 5), 15);
  assertEquals(add19(-1, 1), 0);
});

Deno.test("subtract19 should subtract two numbers", () => {
  assertEquals(subtract19(5, 3), 2);
  assertEquals(subtract19(10, 5), 5);
  assertEquals(subtract19(0, 1), -1);
});

Deno.test("multiply19 should multiply two numbers", () => {
  assertEquals(multiply19(2, 3), 6);
  assertEquals(multiply19(5, 4), 20);
  assertEquals(multiply19(0, 10), 0);
});

Deno.test("divide19 should divide two numbers", () => {
  assertEquals(divide19(6, 2), 3);
  assertEquals(divide19(10, 5), 2);
  assertEquals(divide19(9, 3), 3);
});
