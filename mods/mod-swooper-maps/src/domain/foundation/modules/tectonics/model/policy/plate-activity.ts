import { clampFinite } from "@swooper/mapgen-core/lib/math";

function clampActivity01(value: number | undefined): number {
  return clampFinite(value ?? 0.5, 0, 1, 0.5);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Plate activity scales orogeny emission intensity in foundation-tectonics after
 * boundary-regime classification. The mapping is smooth and monotonic: higher
 * activity means more vigorous mountain building and arc volcanism, not relocated land.
 */
export function resolvePlateActivityOrogenyMultiplier(value: number | undefined): number {
  const v = clampActivity01(value);
  if (v <= 0.5) return lerp(0.8, 1.0, v / 0.5);
  return lerp(1.0, 1.2, (v - 0.5) / 0.5);
}
