/**
 * Helper to convert days to milliseconds
 *
 * @param n number of days
 * @returns milliseconds
 */
export function days(n: number) {
  return n * 24 * 60 * 60 * 1000;
}

/**
 * Helper to convert minutes to milliseconds
 *
 * @param n number of minutes
 * @returns milliseconds
 */
export function minutes(n: number) {
  return n * 60 * 1000;
}

export function daysFromNow(n: number) {
  return Date.now() + days(n);
}
