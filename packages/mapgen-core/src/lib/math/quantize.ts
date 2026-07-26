import { clamp, clampInt } from "@mapgen/lib/math/clamp.js";

/**
 * Rounds to the nearest unsigned byte and saturates to `[0, 255]`.
 * Positive infinity maps to `255`; all other non-finite inputs map to `0`.
 */
export function quantizeU8(value: number): number {
  if (value === Number.POSITIVE_INFINITY) return 255;
  if (!Number.isFinite(value)) return 0;
  return clamp(Math.round(value), 0, 255);
}

/**
 * Rounds with JavaScript `Math.round` and saturates to the symmetric signed-byte range `[-127, 127]`.
 * Infinities select their respective endpoint and `NaN` maps to `0`; `-128` is deliberately excluded.
 */
export function quantizeI8Symmetric(value: number): number {
  if (value === Number.POSITIVE_INFINITY) return 127;
  if (value === Number.NEGATIVE_INFINITY) return -127;
  if (!Number.isFinite(value)) return 0;
  return clampInt(Math.round(value), -127, 127);
}
