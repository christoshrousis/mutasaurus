export function sum(a: number, b: number): number {
  // Basic arithmetic operations
  const sum = a + b;
  const difference = a - b;
  const product = a * b;
  const quotient = a / b;

  // More complex expressions
  const complex1 = (a + b) * (a - b);
  const complex2 = (a * b) / (a + b);
  const complex3 = (a - b) + (a * b);

  return sum + difference + product + quotient + complex1 + complex2 + complex3;
}
