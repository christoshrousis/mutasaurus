import { assertEquals } from "@std/assert";
import { add17, subtract17, multiply17, divide17 } from "./math-utils-17.ts";

Deno.test("add17 should add two numbers", () => {
  assertEquals(add17(2, 3), 5);
  assertEquals(add17(10, 5), 15);
  assertEquals(add17(-1, 1), 0);
});

Deno.test("subtract17 should subtract two numbers", () => {
  assertEquals(subtract17(5, 3), 2);
  assertEquals(subtract17(10, 5), 5);
  assertEquals(subtract17(0, 1), -1);
});

Deno.test("multiply17 should multiply two numbers", () => {
  assertEquals(multiply17(2, 3), 6);
  assertEquals(multiply17(5, 4), 20);
  assertEquals(multiply17(0, 10), 0);
});

Deno.test("divide17 should divide two numbers", () => {
  assertEquals(divide17(6, 2), 3);
  assertEquals(divide17(10, 5), 2);
  assertEquals(divide17(9, 3), 3);
});
