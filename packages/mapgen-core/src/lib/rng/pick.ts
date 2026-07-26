import type { RngFn } from "@mapgen/lib/rng/unit.js";

/**
 * Selects one array slot with a single labeled bounded RNG draw.
 * Empty arrays consume no draw and return `null`; a nullish or invalid selected slot also collapses to `null`.
 */
export function pickRandom<T>(items: readonly T[], rng: RngFn, label: string): T | null {
  if (!items.length) return null;
  const index = rng(items.length, label) % items.length;
  return items[index] ?? null;
}
