/**
 * Core module - Shared utilities and types
 *
 * This module contains utility functions and types used
 * across all other modules.
 */

export * from "@mapgen/core/assertions.js";
export * from "@mapgen/core/env.js";
export * from "@mapgen/core/plot-tags.js";
export * from "@mapgen/core/terrain-constants.js";
// Re-export types
export * from "@mapgen/core/types.js";
export { inBounds } from "@mapgen/lib/grid/bounds.js";
export { idx, xyFromIndex } from "@mapgen/lib/grid/indexing.js";
export { wrapX } from "@mapgen/lib/grid/wrap.js";

export { clampChance, rollPercent } from "@mapgen/lib/math/chance.js";
export { clamp, clamp01, clampInt, clampPct } from "@mapgen/lib/math/clamp.js";
export { lerp } from "@mapgen/lib/math/lerp.js";
export { normalizeRange } from "@mapgen/lib/math/range.js";
export type { LabelRng } from "@mapgen/lib/rng/label.js";
export { createLabelRng, deriveStepSeed } from "@mapgen/lib/rng/label.js";

/**
 * Fill a typed array buffer with a value
 */
export function fillBuffer(
  buffer: { fill: (value: number) => void } | null | undefined,
  value: number
): void {
  if (buffer && typeof buffer.fill === "function") {
    buffer.fill(value);
  }
}
