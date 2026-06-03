import { forEachHexNeighborOddQ } from "@mapgen/lib/grid/neighborhood/hex-oddq.js";

export function forEachHexWithinDistanceOddQ(
  params: {
    centerIndex: number;
    width: number;
    height: number;
    maxDistance: number;
    includeCenter?: boolean;
  },
  fn: (index: number, distance: number) => void
): void {
  const width = Math.max(0, params.width | 0);
  const height = Math.max(0, params.height | 0);
  const size = width * height;
  const centerIndex = params.centerIndex | 0;
  if (size <= 0 || centerIndex < 0 || centerIndex >= size) return;

  const maxDistance = Math.max(0, Math.min(255, Math.round(params.maxDistance))) | 0;
  const distance = new Uint8Array(size);
  distance.fill(255);
  const queue = [centerIndex];
  distance[centerIndex] = 0;

  if (params.includeCenter !== false) fn(centerIndex, 0);

  let head = 0;
  while (head < queue.length) {
    const index = queue[head++]!;
    const currentDistance = distance[index] ?? 255;
    if (currentDistance >= maxDistance) continue;

    const x = index % width;
    const y = Math.floor(index / width);
    forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
      const neighbor = ny * width + nx;
      if ((distance[neighbor] ?? 255) <= currentDistance + 1) return;
      const nextDistance = currentDistance + 1;
      distance[neighbor] = nextDistance;
      fn(neighbor, nextDistance);
      queue.push(neighbor);
    });
  }
}

export function hasMaskWithinHexDistanceOddQ(params: {
  mask: Uint8Array;
  centerIndex: number;
  width: number;
  height: number;
  maxDistance: number;
  includeCenter?: boolean;
}): boolean {
  let found = false;
  forEachHexWithinDistanceOddQ(
    {
      centerIndex: params.centerIndex,
      width: params.width,
      height: params.height,
      maxDistance: params.maxDistance,
      includeCenter: params.includeCenter,
    },
    (index) => {
      if (params.mask[index] === 1) found = true;
    }
  );
  return found;
}
