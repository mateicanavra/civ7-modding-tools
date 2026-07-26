import type { LabelRng } from "@mapgen/lib/rng/label.js";

/**
 * Rounds a percentage to the discrete `[0, 100]` chance scale used by integer RNG draws.
 * Infinities saturate at an endpoint, while `NaN` remains `NaN`.
 */
export function clampChance(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * Tests a labeled RNG draw from `[0, 100)` against a percentage threshold.
 * Nonpositive chances short-circuit without consuming a draw; correctness assumes the RNG honors its bound.
 */
export function rollPercent(rng: LabelRng, label: string, chance: number): boolean {
  return chance > 0 && rng(100, label) < chance;
}
