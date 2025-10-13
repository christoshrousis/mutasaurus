import { assertEquals } from "@std/assert";
import { add02, subtract02, multiply02, divide02 } from "./math-utils-02.ts";

Deno.test("add02 should add two numbers", () => {
  assertEquals(add02(2, 3), 5);
  assertEquals(add02(10, 5), 15);
  assertEquals(add02(-1, 1), 0);
});

Deno.test("subtract02 should subtract two numbers", () => {
  assertEquals(subtract02(5, 3), 2);
  assertEquals(subtract02(10, 5), 5);
  assertEquals(subtract02(0, 1), -1);
});

Deno.test("multiply02 should multiply two numbers", () => {
  assertEquals(multiply02(2, 3), 6);
  assertEquals(multiply02(5, 4), 20);
  assertEquals(multiply02(0, 10), 0);
});

Deno.test("divide02 should divide two numbers", () => {
  assertEquals(divide02(6, 2), 3);
  assertEquals(divide02(10, 5), 2);
  assertEquals(divide02(9, 3), 3);
});
