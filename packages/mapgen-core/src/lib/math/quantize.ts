import { clamp, clampInt } from "@mapgen/lib/math/clamp.js";

export function quantizeU8(value: number): number {
  if (value === Number.POSITIVE_INFINITY) return 255;
  if (!Number.isFinite(value)) return 0;
  return clamp(Math.round(value), 0, 255);
}

export function quantizeI8Symmetric(value: number): number {
  if (value === Number.POSITIVE_INFINITY) return 127;
  if (value === Number.NEGATIVE_INFINITY) return -127;
  if (!Number.isFinite(value)) return 0;
  return clampInt(Math.round(value), -127, 127);
}
