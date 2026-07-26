import { clamp01 } from "@mapgen/lib/math/clamp.js";

/**
 * Maps a scalar linearly into the saturated `[0, 1]` interval.
 * Degenerate or inverted ranges become a hard threshold at `max` rather than dividing by zero.
 */
export function normalizeRange(value: number, min: number, max: number): number {
  if (max <= min) return value >= max ? 1 : 0;
  return clamp01((value - min) / (max - min));
}
