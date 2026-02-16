/**
 * Divide numerator by denominator, treating null or 0 as 0
 */
export function divide(numerator: number | null, denominator: number | null) {
  if (!numerator || !denominator) {
    return 0
  }
  return numerator / denominator
}
