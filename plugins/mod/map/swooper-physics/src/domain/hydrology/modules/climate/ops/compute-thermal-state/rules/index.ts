/**
 * Bounds a computed surface temperature to the strategy's configured physical limits.
 *
 * @param value - Candidate temperature after insolation, lapse-rate, and land adjustments.
 * @param min - Coldest admitted temperature.
 * @param max - Warmest admitted temperature.
 * @returns The bounded temperature value.
 */
export function clampNumber(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
