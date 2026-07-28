import { clamp01 } from "@swooper/mapgen-core/lib/math";

/**
 * Rounds and saturates a fractional cover or albedo value into its artifact byte representation.
 *
 * @param value - Candidate byte-scale value, usually a normalized fraction multiplied by 255.
 * @returns An integer in the `0..255` range.
 */
export function clampU8(value: number): number {
  return (Math.max(0, Math.min(255, Math.round(value))) | 0) & 0xff;
}

/**
 * Converts a descending temperature threshold pair into a normalized cryosphere response.
 *
 * Values at `start` map to zero and values at or below the colder `full` threshold map to one.
 * Coincident thresholds act as a deterministic hard cutoff.
 *
 * @param value - Surface temperature to classify.
 * @param start - Warmer onset threshold.
 * @param full - Colder full-response threshold.
 * @returns A threshold response in `[0, 1]`.
 */
export function lerp01(value: number, start: number, full: number): number {
  const denom = start - full;
  if (Math.abs(denom) < 1e-6) return value <= full ? 1 : 0;
  return clamp01((start - value) / denom);
}
