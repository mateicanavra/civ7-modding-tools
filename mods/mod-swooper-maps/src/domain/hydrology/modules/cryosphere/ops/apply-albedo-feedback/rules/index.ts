import { clamp01 } from "@swooper/mapgen-core/lib/math";

/**
 * Enforces the configured temperature envelope after each albedo-feedback iteration.
 *
 * @param value - Candidate temperature after snow and sea-ice cooling.
 * @param min - Coldest admitted temperature.
 * @param max - Warmest admitted temperature.
 * @returns The bounded temperature value.
 */
export function clampNumber(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Converts a descending temperature threshold pair into a normalized frozen-state fraction.
 *
 * Values at `start` map to zero and values at or below the colder `full` threshold map to one.
 * Coincident thresholds behave as a hard cutoff rather than producing an unstable division.
 *
 * @param value - Surface temperature to classify.
 * @param start - Warmer threshold where the frozen response begins.
 * @param full - Colder threshold where the response reaches full strength.
 * @returns A frozen-state fraction in `[0, 1]`.
 */
export function lerp01(value: number, start: number, full: number): number {
  const denom = start - full;
  if (Math.abs(denom) < 1e-6) return value <= full ? 1 : 0;
  return clamp01((start - value) / denom);
}
