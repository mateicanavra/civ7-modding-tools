import { clampFinite } from "@swooper/mapgen-core/lib/math";

function clampActivity01(value: number | undefined): number {
  return clampFinite(value ?? 0.5, 0, 1, 0.5);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Plate activity scales orogeny emission INTENSITY — convergent uplift and
 * subduction volcanism — in foundation-tectonics, applied AFTER boundary-regime
 * classification. Because no boundary appears or disappears (the regime topology
 * is fixed), the lever is smooth and monotonic: higher activity = more vigorous
 * mountain building and arc volcanism, not relocated land. Projection then
 * materializes the resulting tectonic truth faithfully.
 *
 * Mapping: 0.0 -> 0.8, 0.5 -> 1.0, 1.0 -> 1.2 (piecewise linear). 0.5 is an exact no-op.
 */
export function resolvePlateActivityOrogenyMultiplier(value: number | undefined): number {
  const v = clampActivity01(value);
  if (v <= 0.5) return lerp(0.8, 1.0, v / 0.5);
  return lerp(1.0, 1.2, (v - 0.5) / 0.5);
}
