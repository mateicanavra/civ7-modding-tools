import { normalizeFractal } from "@swooper/mapgen-core/lib/noise";

/**
 * Normalizes fractal values to a 0..1 range.
 */
export function normalizeMountainFractal(value: number): number {
  return normalizeFractal(value);
}

