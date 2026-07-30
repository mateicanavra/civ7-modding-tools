import { idx } from "@swooper/mapgen-core";

/**
 * Resolves the donor tile opposite a prevailing cardinal wind direction.
 * An off-map donor falls back to the destination itself, making map edges retain local moisture.
 *
 * @param x - Destination tile column.
 * @param y - Destination tile row.
 * @param width - Tile-grid width.
 * @param height - Tile-grid height.
 * @param dx - Prevailing-wind column offset.
 * @param dy - Prevailing-wind row offset.
 * @returns The flat index of the upwind donor, or the destination index at an edge.
 */
export function upwindIndex(
  x: number,
  y: number,
  width: number,
  height: number,
  dx: number,
  dy: number
): number {
  const nx = x - dx;
  const ny = y - dy;
  if (nx < 0 || nx >= width || ny < 0 || ny >= height) return idx(x, y, width);
  return idx(nx, ny, width);
}
