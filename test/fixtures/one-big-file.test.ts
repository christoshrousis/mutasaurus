import { assertEquals } from "@std/assert";
import * as BigFile from "./one-big-file.ts";

Deno.test("add should add two numbers", () => {
  assertEquals(BigFile.add(2, 3), 5);
  assertEquals(BigFile.add(10, 5), 15);
});

Deno.test("subtract should subtract two numbers", () => {
  assertEquals(BigFile.subtract(5, 3), 2);
  assertEquals(BigFile.subtract(10, 5), 5);
});

Deno.test("multiply should multiply two numbers", () => {
  assertEquals(BigFile.multiply(2, 3), 6);
  assertEquals(BigFile.multiply(5, 4), 20);
});

Deno.test("divide should divide two numbers", () => {
  assertEquals(BigFile.divide(6, 2), 3);
  assertEquals(BigFile.divide(10, 5), 2);
});

Deno.test("modulo should return remainder", () => {
  assertEquals(BigFile.modulo(7, 3), 1);
  assertEquals(BigFile.modulo(10, 5), 0);
});

Deno.test("power should return power", () => {
  assertEquals(BigFile.power(2, 3), 8);
  assertEquals(BigFile.power(5, 2), 25);
});

Deno.test("max should return maximum", () => {
  assertEquals(BigFile.max(5, 3), 5);
  assertEquals(BigFile.max(10, 20), 20);
});

Deno.test("min should return minimum", () => {
  assertEquals(BigFile.min(5, 3), 3);
  assertEquals(BigFile.min(10, 20), 10);
});

Deno.test("abs should return absolute value", () => {
  assertEquals(BigFile.abs(-5), 5);
  assertEquals(BigFile.abs(5), 5);
});

Deno.test("isEven should check if even", () => {
  assertEquals(BigFile.isEven(4), true);
  assertEquals(BigFile.isEven(5), false);
});

Deno.test("isOdd should check if odd", () => {
  assertEquals(BigFile.isOdd(5), true);
  assertEquals(BigFile.isOdd(4), false);
});

Deno.test("isPositive should check if positive", () => {
  assertEquals(BigFile.isPositive(5), true);
  assertEquals(BigFile.isPositive(-5), false);
});

Deno.test("isNegative should check if negative", () => {
  assertEquals(BigFile.isNegative(-5), true);
  assertEquals(BigFile.isNegative(5), false);
});

Deno.test("isZero should check if zero", () => {
  assertEquals(BigFile.isZero(0), true);
  assertEquals(BigFile.isZero(5), false);
});

Deno.test("increment should add one", () => {
  assertEquals(BigFile.increment(5), 6);
  assertEquals(BigFile.increment(-1), 0);
});

Deno.test("decrement should subtract one", () => {
  assertEquals(BigFile.decrement(5), 4);
  assertEquals(BigFile.decrement(0), -1);
});

Deno.test("double should multiply by two", () => {
  assertEquals(BigFile.double(5), 10);
  assertEquals(BigFile.double(-3), -6);
});

Deno.test("triple should multiply by three", () => {
  assertEquals(BigFile.triple(5), 15);
  assertEquals(BigFile.triple(-2), -6);
});

Deno.test("half should divide by two", () => {
  assertEquals(BigFile.half(10), 5);
  assertEquals(BigFile.half(7), 3.5);
});

Deno.test("square should square number", () => {
  assertEquals(BigFile.square(5), 25);
  assertEquals(BigFile.square(-3), 9);
});

Deno.test("cube should cube number", () => {
  assertEquals(BigFile.cube(3), 27);
  assertEquals(BigFile.cube(-2), -8);
});

Deno.test("negate should negate number", () => {
  assertEquals(BigFile.negate(5), -5);
  assertEquals(BigFile.negate(-5), 5);
});

Deno.test("sum should sum array", () => {
  assertEquals(BigFile.sum([1, 2, 3]), 6);
  assertEquals(BigFile.sum([10, 5]), 15);
});

Deno.test("average should calculate average", () => {
  assertEquals(BigFile.average([1, 2, 3]), 2);
  assertEquals(BigFile.average([10, 20]), 15);
});

Deno.test("product should multiply array", () => {
  assertEquals(BigFile.product([2, 3, 4]), 24);
  assertEquals(BigFile.product([5, 2]), 10);
});

Deno.test("maxArray should find max in array", () => {
  assertEquals(BigFile.maxArray([1, 5, 3]), 5);
  assertEquals(BigFile.maxArray([10, 2, 8]), 10);
});

Deno.test("minArray should find min in array", () => {
  assertEquals(BigFile.minArray([1, 5, 3]), 1);
  assertEquals(BigFile.minArray([10, 2, 8]), 2);
});

Deno.test("countPositive should count positive numbers", () => {
  assertEquals(BigFile.countPositive([1, -2, 3, -4, 5]), 3);
  assertEquals(BigFile.countPositive([-1, -2, -3]), 0);
});

Deno.test("countNegative should count negative numbers", () => {
  assertEquals(BigFile.countNegative([1, -2, 3, -4, 5]), 2);
  assertEquals(BigFile.countNegative([1, 2, 3]), 0);
});

Deno.test("countZero should count zeros", () => {
  assertEquals(BigFile.countZero([0, 1, 0, 2]), 2);
  assertEquals(BigFile.countZero([1, 2, 3]), 0);
});

Deno.test("countEven should count even numbers", () => {
  assertEquals(BigFile.countEven([1, 2, 3, 4, 5]), 2);
  assertEquals(BigFile.countEven([1, 3, 5]), 0);
});

Deno.test("countOdd should count odd numbers", () => {
  assertEquals(BigFile.countOdd([1, 2, 3, 4, 5]), 3);
  assertEquals(BigFile.countOdd([2, 4, 6]), 0);
});

Deno.test("filterPositive should filter positive numbers", () => {
  assertEquals(BigFile.filterPositive([1, -2, 3, -4, 5]), [1, 3, 5]);
});

Deno.test("filterNegative should filter negative numbers", () => {
  assertEquals(BigFile.filterNegative([1, -2, 3, -4, 5]), [-2, -4]);
});

Deno.test("filterEven should filter even numbers", () => {
  assertEquals(BigFile.filterEven([1, 2, 3, 4, 5]), [2, 4]);
});

Deno.test("filterOdd should filter odd numbers", () => {
  assertEquals(BigFile.filterOdd([1, 2, 3, 4, 5]), [1, 3, 5]);
});

Deno.test("mapDouble should double all numbers", () => {
  assertEquals(BigFile.mapDouble([1, 2, 3]), [2, 4, 6]);
});

Deno.test("mapTriple should triple all numbers", () => {
  assertEquals(BigFile.mapTriple([1, 2, 3]), [3, 6, 9]);
});

Deno.test("mapSquare should square all numbers", () => {
  assertEquals(BigFile.mapSquare([2, 3, 4]), [4, 9, 16]);
});

Deno.test("mapNegate should negate all numbers", () => {
  assertEquals(BigFile.mapNegate([1, -2, 3]), [-1, 2, -3]);
});

Deno.test("mapAbs should get absolute values", () => {
  assertEquals(BigFile.mapAbs([1, -2, 3, -4]), [1, 2, 3, 4]);
});

Deno.test("range should create range", () => {
  assertEquals(BigFile.range(1, 5), [1, 2, 3, 4, 5]);
  assertEquals(BigFile.range(0, 3), [0, 1, 2, 3]);
});

Deno.test("rangeStep should create range with step", () => {
  assertEquals(BigFile.rangeStep(0, 10, 2), [0, 2, 4, 6, 8, 10]);
  assertEquals(BigFile.rangeStep(1, 10, 3), [1, 4, 7, 10]);
});

Deno.test("factorial should calculate factorial", () => {
  assertEquals(BigFile.factorial(5), 120);
  assertEquals(BigFile.factorial(0), 1);
});

Deno.test("fibonacci should calculate fibonacci", () => {
  assertEquals(BigFile.fibonacci(6), 8);
  assertEquals(BigFile.fibonacci(0), 0);
});

Deno.test("gcd should calculate GCD", () => {
  assertEquals(BigFile.gcd(48, 18), 6);
  assertEquals(BigFile.gcd(100, 50), 50);
});

Deno.test("lcm should calculate LCM", () => {
  assertEquals(BigFile.lcm(4, 6), 12);
  assertEquals(BigFile.lcm(21, 6), 42);
});

Deno.test("isPrime should check if prime", () => {
  assertEquals(BigFile.isPrime(7), true);
  assertEquals(BigFile.isPrime(4), false);
});

Deno.test("sumOfDigits should sum digits", () => {
  assertEquals(BigFile.sumOfDigits(123), 6);
  assertEquals(BigFile.sumOfDigits(999), 27);
});

Deno.test("reverseNumber should reverse number", () => {
  assertEquals(BigFile.reverseNumber(123), 321);
  assertEquals(BigFile.reverseNumber(-456), -654);
});

Deno.test("isPalindrome should check if palindrome", () => {
  assertEquals(BigFile.isPalindrome(121), true);
  assertEquals(BigFile.isPalindrome(123), false);
});

Deno.test("clamp should clamp value", () => {
  assertEquals(BigFile.clamp(5, 0, 10), 5);
  assertEquals(BigFile.clamp(-5, 0, 10), 0);
  assertEquals(BigFile.clamp(15, 0, 10), 10);
});
