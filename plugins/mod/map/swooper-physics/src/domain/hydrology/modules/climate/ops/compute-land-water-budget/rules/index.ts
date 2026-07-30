import { clamp01 } from "@swooper/mapgen-core/lib/math";

/**
 * Normalizes a value between the water-budget strategy's lower and upper calibration points.
 * Degenerate bounds resolve deterministically to a threshold instead of dividing by near-zero.
 *
 * @param value - Temperature or other scalar to normalize.
 * @param min - Calibration point that maps to zero.
 * @param max - Calibration point that maps to one.
 * @returns A normalized factor in `[0, 1]`.
 */
export function lerp01(value: number, min: number, max: number): number {
  const denom = max - min;
  if (Math.abs(denom) < 1e-6) return value >= max ? 1 : 0;
  return clamp01((value - min) / denom);
}
