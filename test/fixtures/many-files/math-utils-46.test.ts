import { assertEquals } from "@std/assert";
import { add46, subtract46, multiply46, divide46 } from "./math-utils-46.ts";

Deno.test("add46 should add two numbers", () => {
  assertEquals(add46(2, 3), 5);
  assertEquals(add46(10, 5), 15);
  assertEquals(add46(-1, 1), 0);
});

Deno.test("subtract46 should subtract two numbers", () => {
  assertEquals(subtract46(5, 3), 2);
  assertEquals(subtract46(10, 5), 5);
  assertEquals(subtract46(0, 1), -1);
});

Deno.test("multiply46 should multiply two numbers", () => {
  assertEquals(multiply46(2, 3), 6);
  assertEquals(multiply46(5, 4), 20);
  assertEquals(multiply46(0, 10), 0);
});

Deno.test("divide46 should divide two numbers", () => {
  assertEquals(divide46(6, 2), 3);
  assertEquals(divide46(10, 5), 2);
  assertEquals(divide46(9, 3), 3);
});
