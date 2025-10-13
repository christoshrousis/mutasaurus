import { assertEquals } from "@std/assert";
import { add08, subtract08, multiply08, divide08 } from "./math-utils-08.ts";

Deno.test("add08 should add two numbers", () => {
  assertEquals(add08(2, 3), 5);
  assertEquals(add08(10, 5), 15);
  assertEquals(add08(-1, 1), 0);
});

Deno.test("subtract08 should subtract two numbers", () => {
  assertEquals(subtract08(5, 3), 2);
  assertEquals(subtract08(10, 5), 5);
  assertEquals(subtract08(0, 1), -1);
});

Deno.test("multiply08 should multiply two numbers", () => {
  assertEquals(multiply08(2, 3), 6);
  assertEquals(multiply08(5, 4), 20);
  assertEquals(multiply08(0, 10), 0);
});

Deno.test("divide08 should divide two numbers", () => {
  assertEquals(divide08(6, 2), 3);
  assertEquals(divide08(10, 5), 2);
  assertEquals(divide08(9, 3), 3);
});
