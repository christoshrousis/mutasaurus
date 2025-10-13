/**
 * A simple function with strong typing that should produce type errors when mutated
 */
export function calculateDiscount(price: number, discountPercent: number): number {
  // This calculation will cause type errors when operators are mutated
  // For example, changing - to + will still be valid syntax, but changing
  // arithmetic operators in ways that affect type safety will be caught
  const discount = price * (discountPercent / 100);
  return price - discount;
}

/**
 * A function that works with specific types
 */
export function isEligibleForDiscount(age: number): boolean {
  // If this < is mutated to >, it stays type-safe
  // But other mutations might cause type errors
  return age >= 65;
}
