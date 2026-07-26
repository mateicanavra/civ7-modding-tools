import { idx } from "@swooper/mapgen-core/lib/grid";

/**
 * Enforces the precipitation contract's `0..200` rainfall scale before byte encoding.
 *
 * @param rainfall - Candidate rainfall after moisture, terrain, and noise modifiers.
 * @returns Rainfall constrained to the authored physical scale.
 */
export function clampRainfall(rainfall: number): number {
  return Math.max(0, Math.min(200, rainfall));
}

/**
 * Projects the authored rainfall scale onto the full byte-valued humidity evidence range.
 *
 * @param rainfall - Rainfall on the `0..200` precipitation scale; outliers are clamped first.
 * @returns Rounded humidity in the `0..255` artifact representation.
 */
export function rainfallToHumidityU8(rainfall: number): number {
  const rf = clampRainfall(rainfall);
  return (Math.max(0, Math.min(255, Math.round((rf / 200) * 255))) | 0) & 0xff;
}

/**
 * Applies the refinement strategy's local low-basin proxy around one tile.
 *
 * This is deliberately a bounded square-neighborhood test, not drainage routing: a basin is
 * considered closed only when no sampled neighbor is below `origin + openThresholdM`.
 *
 * @param x - Candidate tile column.
 * @param y - Candidate tile row.
 * @param width - Tile-grid width.
 * @param height - Tile-grid height.
 * @param elevation - Per-tile terrain elevation.
 * @param radius - Neighborhood radius, clamped to at least one.
 * @param openThresholdM - Relief margin that permits a neighbor to open the basin.
 * @returns Whether the candidate passes the local closed-basin proxy.
 */
export function isLowBasinClosed(
  x: number,
  y: number,
  width: number,
  height: number,
  elevation: Int16Array,
  radius: number,
  openThresholdM: number
): boolean {
  const elev = elevation[idx(x, y, width)] | 0;
  const basinRadius = Math.max(1, radius | 0);
  const threshold = Math.max(0, openThresholdM | 0);

  for (let dy = -basinRadius; dy <= basinRadius; dy++) {
    const ny = y + dy;
    if (ny < 0 || ny >= height) continue;
    for (let dx = -basinRadius; dx <= basinRadius; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      if (nx < 0 || nx >= width) continue;
      if ((elevation[idx(nx, ny, width)] | 0) < elev + threshold) return false;
    }
  }
  return true;
}
