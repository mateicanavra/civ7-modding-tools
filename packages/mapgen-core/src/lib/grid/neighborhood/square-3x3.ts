import { inBounds } from "@mapgen/lib/grid/bounds.js";

/**
 * Visits the in-bounds cells in the square 3x3 neighborhood, excluding the center.
 * The traversal clips both axes and never wraps.
 */
export function forEachNeighbor3x3(
  x: number,
  y: number,
  width: number,
  height: number,
  fn: (nx: number, ny: number) => void
): void {
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (!inBounds(nx, ny, width, height)) continue;
      fn(nx, ny);
    }
  }
}

/**
 * Tests square 3x3 neighbors until the predicate first succeeds.
 * The center and out-of-bounds coordinates are skipped, and a full miss returns `false`.
 */
export function someNeighbor3x3(
  x: number,
  y: number,
  width: number,
  height: number,
  predicate: (nx: number, ny: number) => boolean
): boolean {
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (!inBounds(nx, ny, width, height)) continue;
      if (predicate(nx, ny)) return true;
    }
  }
  return false;
}
