import { idx } from "@swooper/mapgen-core/lib/grid";

/**
 * Computes raster-step distance from every tile to its nearest water source.
 *
 * Climate strategies and advisory projections share this eight-neighbor distance field so the
 * evidence describes the same coastal reach used by precipitation behavior. Water is zero; when
 * the map contains no water, every entry remains `-1`.
 */
export function computeDistanceToWater(
  width: number,
  height: number,
  landMask: ArrayLike<number>
): Int16Array {
  const distances = new Int16Array(width * height);
  distances.fill(-1);
  const queue: number[] = [];

  for (let index = 0; index < distances.length; index += 1) {
    if (landMask[index] !== 0) continue;
    distances[index] = 0;
    queue.push(index);
  }

  const offsets = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1],
  ] as const;

  for (let head = 0; head < queue.length; head += 1) {
    const index = queue[head]!;
    const x = index % width;
    const y = Math.floor(index / width);
    const nextDistance = (distances[index] ?? 0) + 1;

    for (const [dx, dy] of offsets) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
      const neighbor = idx(nx, ny, width);
      if (distances[neighbor] !== -1) continue;
      distances[neighbor] = nextDistance;
      queue.push(neighbor);
    }
  }

  return distances;
}
