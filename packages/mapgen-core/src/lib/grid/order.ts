export type DispersedGridOrderOptions = Readonly<{
  width: number;
  height: number;
  sectorCols?: number;
  sectorRows?: number;
}>;

/**
 * Builds a deterministic whole-grid order that spreads early candidates across
 * coarse map sectors before filling sector interiors. This is useful for
 * fallback placement passes where row-major order would bias output toward the
 * top-left/top bands of the map.
 */
export function buildDispersedGridOrder(options: DispersedGridOrderOptions): number[] {
  const width = Math.max(0, options.width | 0);
  const height = Math.max(0, options.height | 0);
  const size = width * height;
  if (width <= 0 || height <= 0 || size <= 0) return [];

  const sectorCols = Math.max(1, Math.min(width, options.sectorCols ?? 8));
  const sectorRows = Math.max(1, Math.min(height, options.sectorRows ?? 4));
  const bucketCount = sectorCols * sectorRows;
  const buckets = Array.from({ length: bucketCount }, () => [] as number[]);

  for (let plotIndex = 0; plotIndex < size; plotIndex++) {
    const x = plotIndex % width;
    const y = (plotIndex / width) | 0;
    const sx = Math.min(sectorCols - 1, Math.floor((x * sectorCols) / width));
    const sy = Math.min(sectorRows - 1, Math.floor((y * sectorRows) / height));
    buckets[sy * sectorCols + sx]?.push(plotIndex);
  }

  for (let bucketIndex = 0; bucketIndex < buckets.length; bucketIndex++) {
    const bucket = buckets[bucketIndex]!;
    bucket.sort((a, b) => {
      const rankA = gridOrderHash(a, width, height, bucketIndex);
      const rankB = gridOrderHash(b, width, height, bucketIndex);
      if (rankA !== rankB) return rankA - rankB;
      return a - b;
    });
  }

  const sectorOrder = Array.from({ length: bucketCount }, (_value, index) => index).sort((a, b) => {
    const rankA = gridOrderHash(a, sectorCols, sectorRows, 0x5eed);
    const rankB = gridOrderHash(b, sectorCols, sectorRows, 0x5eed);
    if (rankA !== rankB) return rankA - rankB;
    return a - b;
  });

  const order: number[] = [];
  for (let offset = 0; order.length < size; offset++) {
    let appended = false;
    for (const sectorIndex of sectorOrder) {
      const next = buckets[sectorIndex]?.[offset];
      if (next === undefined) continue;
      order.push(next);
      appended = true;
    }
    if (!appended) break;
  }

  return order;
}

function gridOrderHash(value: number, width: number, height: number, salt: number): number {
  let state = (value | 0) ^ Math.imul(width | 0, 0x9e3779b1) ^ Math.imul(height | 0, 0x85ebca6b);
  state ^= Math.imul(salt | 0, 0xc2b2ae35);
  state ^= state >>> 16;
  state = Math.imul(state, 0x7feb352d);
  state ^= state >>> 15;
  state = Math.imul(state, 0x846ca68b);
  state ^= state >>> 16;
  return state >>> 0;
}
