import { assertEquals } from "@std/assert";
import { add42, subtract42, multiply42, divide42 } from "./math-utils-42.ts";

Deno.test("add42 should add two numbers", () => {
  assertEquals(add42(2, 3), 5);
  assertEquals(add42(10, 5), 15);
  assertEquals(add42(-1, 1), 0);
});

Deno.test("subtract42 should subtract two numbers", () => {
  assertEquals(subtract42(5, 3), 2);
  assertEquals(subtract42(10, 5), 5);
  assertEquals(subtract42(0, 1), -1);
});

Deno.test("multiply42 should multiply two numbers", () => {
  assertEquals(multiply42(2, 3), 6);
  assertEquals(multiply42(5, 4), 20);
  assertEquals(multiply42(0, 10), 0);
});

Deno.test("divide42 should divide two numbers", () => {
  assertEquals(divide42(6, 2), 3);
  assertEquals(divide42(10, 5), 2);
  assertEquals(divide42(9, 3), 3);
});
