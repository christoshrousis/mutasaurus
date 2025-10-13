// Large file with 50+ functions to test mutation performance

export function add(a: number, b: number): number {
  return a + b;
}

export function subtract(a: number, b: number): number {
  return a - b;
}

export function multiply(a: number, b: number): number {
  return a * b;
}

export function divide(a: number, b: number): number {
  return a / b;
}

export function modulo(a: number, b: number): number {
  return a % b;
}

export function power(a: number, b: number): number {
  return a ** b;
}

export function max(a: number, b: number): number {
  return a > b ? a : b;
}

export function min(a: number, b: number): number {
  return a < b ? a : b;
}

export function abs(n: number): number {
  return n < 0 ? -n : n;
}

export function isEven(n: number): boolean {
  return n % 2 === 0;
}

export function isOdd(n: number): boolean {
  return n % 2 !== 0;
}

export function isPositive(n: number): boolean {
  return n > 0;
}

export function isNegative(n: number): boolean {
  return n < 0;
}

export function isZero(n: number): boolean {
  return n === 0;
}

export function increment(n: number): number {
  return n + 1;
}

export function decrement(n: number): number {
  return n - 1;
}

export function double(n: number): number {
  return n * 2;
}

export function triple(n: number): number {
  return n * 3;
}

export function half(n: number): number {
  return n / 2;
}

export function square(n: number): number {
  return n * n;
}

export function cube(n: number): number {
  return n * n * n;
}

export function negate(n: number): number {
  return -n;
}

export function sum(numbers: number[]): number {
  let total = 0;
  for (const n of numbers) {
    total += n;
  }
  return total;
}

export function average(numbers: number[]): number {
  return sum(numbers) / numbers.length;
}

export function product(numbers: number[]): number {
  let result = 1;
  for (const n of numbers) {
    result *= n;
  }
  return result;
}

export function maxArray(numbers: number[]): number {
  let maxVal = numbers[0]!;
  for (const n of numbers) {
    if (n > maxVal) {
      maxVal = n;
    }
  }
  return maxVal;
}

export function minArray(numbers: number[]): number {
  let minVal = numbers[0]!;
  for (const n of numbers) {
    if (n < minVal!) {
      minVal = n;
    }
  }
  return minVal;
}

export function countPositive(numbers: number[]): number {
  let count = 0;
  for (const n of numbers) {
    if (n > 0) {
      count++;
    }
  }
  return count;
}

export function countNegative(numbers: number[]): number {
  let count = 0;
  for (const n of numbers) {
    if (n < 0) {
      count++;
    }
  }
  return count;
}

export function countZero(numbers: number[]): number {
  let count = 0;
  for (const n of numbers) {
    if (n === 0) {
      count++;
    }
  }
  return count;
}

export function countEven(numbers: number[]): number {
  let count = 0;
  for (const n of numbers) {
    if (n % 2 === 0) {
      count++;
    }
  }
  return count;
}

export function countOdd(numbers: number[]): number {
  let count = 0;
  for (const n of numbers) {
    if (n % 2 !== 0) {
      count++;
    }
  }
  return count;
}

export function filterPositive(numbers: number[]): number[] {
  const result = [];
  for (const n of numbers) {
    if (n > 0) {
      result.push(n);
    }
  }
  return result;
}

export function filterNegative(numbers: number[]): number[] {
  const result = [];
  for (const n of numbers) {
    if (n < 0) {
      result.push(n);
    }
  }
  return result;
}

export function filterEven(numbers: number[]): number[] {
  const result = [];
  for (const n of numbers) {
    if (n % 2 === 0) {
      result.push(n);
    }
  }
  return result;
}

export function filterOdd(numbers: number[]): number[] {
  const result = [];
  for (const n of numbers) {
    if (n % 2 !== 0) {
      result.push(n);
    }
  }
  return result;
}

export function mapDouble(numbers: number[]): number[] {
  const result = [];
  for (const n of numbers) {
    result.push(n * 2);
  }
  return result;
}

export function mapTriple(numbers: number[]): number[] {
  const result = [];
  for (const n of numbers) {
    result.push(n * 3);
  }
  return result;
}

export function mapSquare(numbers: number[]): number[] {
  const result = [];
  for (const n of numbers) {
    result.push(n * n);
  }
  return result;
}

export function mapNegate(numbers: number[]): number[] {
  const result = [];
  for (const n of numbers) {
    result.push(-n);
  }
  return result;
}

export function mapAbs(numbers: number[]): number[] {
  const result = [];
  for (const n of numbers) {
    result.push(n < 0 ? -n : n);
  }
  return result;
}

export function range(start: number, end: number): number[] {
  const result = [];
  for (let i = start; i <= end; i++) {
    result.push(i);
  }
  return result;
}

export function rangeStep(start: number, end: number, step: number): number[] {
  const result = [];
  for (let i = start; i <= end; i += step) {
    result.push(i);
  }
  return result;
}

export function factorial(n: number): number {
  if (n <= 1) {
    return 1;
  }
  return n * factorial(n - 1);
}

export function fibonacci(n: number): number {
  if (n <= 1) {
    return n;
  }
  return fibonacci(n - 1) + fibonacci(n - 2);
}

export function gcd(a: number, b: number): number {
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

export function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}

export function isPrime(n: number): boolean {
  if (n <= 1) {
    return false;
  }
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) {
      return false;
    }
  }
  return true;
}

export function sumOfDigits(n: number): number {
  let sum = 0;
  n = Math.abs(n);
  while (n > 0) {
    sum += n % 10;
    n = Math.floor(n / 10);
  }
  return sum;
}

export function reverseNumber(n: number): number {
  let reversed = 0;
  const isNeg = n < 0;
  n = Math.abs(n);
  while (n > 0) {
    reversed = reversed * 10 + n % 10;
    n = Math.floor(n / 10);
  }
  return isNeg ? -reversed : reversed;
}

export function isPalindrome(n: number): boolean {
  return n === reverseNumber(n);
}

export function clamp(value: number, min: number, max: number): number {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}
