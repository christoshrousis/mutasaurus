import { assertEquals } from "@std/assert";
import { calculateDiscount, isEligibleForDiscount } from "./type-safe-calculation.ts";

Deno.test("calculateDiscount() with 10% discount", () => {
  assertEquals(calculateDiscount(100, 10), 90);
});

Deno.test("calculateDiscount() with 50% discount", () => {
  assertEquals(calculateDiscount(200, 50), 100);
});

Deno.test("isEligibleForDiscount() returns true for seniors", () => {
  assertEquals(isEligibleForDiscount(65), true);
  assertEquals(isEligibleForDiscount(70), true);
});

Deno.test("isEligibleForDiscount() returns false for non-seniors", () => {
  assertEquals(isEligibleForDiscount(64), false);
  assertEquals(isEligibleForDiscount(30), false);
});
