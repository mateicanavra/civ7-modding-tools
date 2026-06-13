import { getHexNeighborIndicesOddQ } from "@mapgen/lib/grid/neighborhood/hex-oddq.js";

export type MaskComponentOddQ = Readonly<{
  id: number;
  size: number;
  indices: readonly number[];
  endpointA: number;
  endpointB: number;
  diameter: number;
}>;

export function computeMaskDistanceFieldOddQ(
  input: Readonly<{
    mask: Uint8Array;
    width: number;
    height: number;
    sources: readonly number[];
  }>
): Int16Array {
  const width = input.width | 0;
  const height = input.height | 0;
  const size = Math.max(0, width * height);
  const distance = new Int16Array(size);
  distance.fill(-1);
  if (input.mask.length !== size || width <= 0 || height <= 0) return distance;

  const queue: number[] = [];
  for (const source of input.sources) {
    const idx = source | 0;
    if (idx < 0 || idx >= size || input.mask[idx] !== 1 || distance[idx] === 0) continue;
    distance[idx] = 0;
    queue.push(idx);
  }

  let head = 0;
  while (head < queue.length) {
    const current = queue[head++]!;
    const x = current % width;
    const y = (current / width) | 0;
    const nextDistance = (distance[current] ?? 0) + 1;
    for (const neighbor of getHexNeighborIndicesOddQ(x, y, width, height)) {
      if (input.mask[neighbor] !== 1 || distance[neighbor] >= 0) continue;
      distance[neighbor] = nextDistance;
      queue.push(neighbor);
    }
  }

  return distance;
}

function farthestReachable(
  indices: readonly number[],
  distance: Int16Array
): { index: number; distance: number } {
  let bestIndex = indices[0] ?? -1;
  let bestDistance = -1;
  for (const idx of indices) {
    const d = distance[idx] ?? -1;
    if (d > bestDistance || (d === bestDistance && idx < bestIndex)) {
      bestIndex = idx;
      bestDistance = d;
    }
  }
  return { index: bestIndex, distance: Math.max(0, bestDistance) };
}

export function collectMaskComponentsOddQ(
  input: Readonly<{
    mask: Uint8Array;
    width: number;
    height: number;
  }>
): MaskComponentOddQ[] {
  const width = input.width | 0;
  const height = input.height | 0;
  const size = Math.max(0, width * height);
  if (input.mask.length !== size || width <= 0 || height <= 0) return [];

  const visited = new Uint8Array(size);
  const components: MaskComponentOddQ[] = [];

  for (let i = 0; i < size; i++) {
    if (input.mask[i] !== 1 || visited[i] === 1) continue;
    const indices: number[] = [];
    const queue = [i];
    visited[i] = 1;

    while (queue.length > 0) {
      const current = queue.pop()!;
      indices.push(current);
      const x = current % width;
      const y = (current / width) | 0;
      for (const neighbor of getHexNeighborIndicesOddQ(x, y, width, height)) {
        if (input.mask[neighbor] !== 1 || visited[neighbor] === 1) continue;
        visited[neighbor] = 1;
        queue.push(neighbor);
      }
    }

    const first = indices[0] ?? i;
    const firstDistances = computeMaskDistanceFieldOddQ({
      mask: input.mask,
      width,
      height,
      sources: [first],
    });
    const endpointA = farthestReachable(indices, firstDistances).index;
    const endpointADistances = computeMaskDistanceFieldOddQ({
      mask: input.mask,
      width,
      height,
      sources: [endpointA],
    });
    const farthest = farthestReachable(indices, endpointADistances);

    components.push({
      id: components.length + 1,
      size: indices.length,
      indices,
      endpointA,
      endpointB: farthest.index,
      diameter: farthest.distance,
    });
  }

  return components;
}
