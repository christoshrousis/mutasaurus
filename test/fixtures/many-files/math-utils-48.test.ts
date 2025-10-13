import { assertEquals } from "@std/assert";
import { add48, subtract48, multiply48, divide48 } from "./math-utils-48.ts";

Deno.test("add48 should add two numbers", () => {
  assertEquals(add48(2, 3), 5);
  assertEquals(add48(10, 5), 15);
  assertEquals(add48(-1, 1), 0);
});

Deno.test("subtract48 should subtract two numbers", () => {
  assertEquals(subtract48(5, 3), 2);
  assertEquals(subtract48(10, 5), 5);
  assertEquals(subtract48(0, 1), -1);
});

Deno.test("multiply48 should multiply two numbers", () => {
  assertEquals(multiply48(2, 3), 6);
  assertEquals(multiply48(5, 4), 20);
  assertEquals(multiply48(0, 10), 0);
});

Deno.test("divide48 should divide two numbers", () => {
  assertEquals(divide48(6, 2), 3);
  assertEquals(divide48(10, 5), 2);
  assertEquals(divide48(9, 3), 3);
});
