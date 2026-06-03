import { forEachHexNeighborOddQ } from "@mapgen/lib/grid/neighborhood/hex-oddq.js";

/**
 * Computes a discrete odd-q hex-grid distance-to-mask field up to `maxDistance`.
 *
 * Source mask tiles have distance 0. Unreached tiles keep distance 255.
 */
export function computeHexDistanceToMask(params: {
  mask: Uint8Array;
  width: number;
  height: number;
  maxDistance: number;
}): Uint8Array {
  const { mask, width, height } = params;
  const w = Math.max(0, width | 0);
  const h = Math.max(0, height | 0);
  const size = w * h;
  const maxDistance = Math.max(0, Math.min(255, Math.round(params.maxDistance))) | 0;

  const distance = new Uint8Array(size);
  distance.fill(255);
  const queue: number[] = [];

  for (let i = 0; i < size; i++) {
    if (mask[i] === 1) {
      distance[i] = 0;
      queue.push(i);
    }
  }

  let head = 0;
  while (head < queue.length) {
    const i = queue[head++]!;
    const d = distance[i] ?? 255;
    if (d >= maxDistance) continue;

    const x = i % w;
    const y = Math.floor(i / w);
    forEachHexNeighborOddQ(x, y, w, h, (nx, ny) => {
      const ni = ny * w + nx;
      if ((distance[ni] ?? 255) <= d + 1) return;
      distance[ni] = (d + 1) as number;
      queue.push(ni);
    });
  }

  return distance;
}
