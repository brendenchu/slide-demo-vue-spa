/**
 * Delay execution for a specified number of milliseconds
 */
export function delay(ms: number = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
