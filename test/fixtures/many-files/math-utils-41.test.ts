import { assertEquals } from "@std/assert";
import { add41, subtract41, multiply41, divide41 } from "./math-utils-41.ts";

Deno.test("add41 should add two numbers", () => {
  assertEquals(add41(2, 3), 5);
  assertEquals(add41(10, 5), 15);
  assertEquals(add41(-1, 1), 0);
});

Deno.test("subtract41 should subtract two numbers", () => {
  assertEquals(subtract41(5, 3), 2);
  assertEquals(subtract41(10, 5), 5);
  assertEquals(subtract41(0, 1), -1);
});

Deno.test("multiply41 should multiply two numbers", () => {
  assertEquals(multiply41(2, 3), 6);
  assertEquals(multiply41(5, 4), 20);
  assertEquals(multiply41(0, 10), 0);
});

Deno.test("divide41 should divide two numbers", () => {
  assertEquals(divide41(6, 2), 3);
  assertEquals(divide41(10, 5), 2);
  assertEquals(divide41(9, 3), 3);
});
