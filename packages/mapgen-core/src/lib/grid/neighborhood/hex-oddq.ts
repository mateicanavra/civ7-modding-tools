import { wrapX } from "@mapgen/lib/grid/wrap.js";

const OFFSETS_ODD: readonly (readonly [number, number])[] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
  [-1, 1],
  [1, 1],
];

const OFFSETS_EVEN: readonly (readonly [number, number])[] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
  [-1, -1],
  [1, -1],
];

export function getHexNeighborIndicesOddQ(x: number, y: number, width: number, height: number): number[] {
  const isOddCol = (x & 1) === 1;
  const offsets = isOddCol ? OFFSETS_ODD : OFFSETS_EVEN;
  const indices: number[] = [];

  for (const [dx, dy] of offsets) {
    const nx = x + dx;
    const ny = y + dy;
    if (ny < 0 || ny >= height) continue;
    const wrappedX = wrapX(nx, width);
    indices.push(ny * width + wrappedX);
  }

  return indices;
}

export function forEachHexNeighborOddQ(
  x: number,
  y: number,
  width: number,
  height: number,
  fn: (nx: number, ny: number) => void
): void {
  const isOddCol = (x & 1) === 1;
  const offsets = isOddCol ? OFFSETS_ODD : OFFSETS_EVEN;

  for (const [dx, dy] of offsets) {
    const nx = x + dx;
    const ny = y + dy;
    if (ny < 0 || ny >= height) continue;
    fn(wrapX(nx, width), ny);
  }
}

export function forEachHexNeighborOddQWithDirection(
  x: number,
  y: number,
  width: number,
  height: number,
  fn: (nx: number, ny: number, directionIndex: number) => void
): void {
  const isOddCol = (x & 1) === 1;
  const offsets = isOddCol ? OFFSETS_ODD : OFFSETS_EVEN;

  for (let directionIndex = 0; directionIndex < offsets.length; directionIndex++) {
    const [dx, dy] = offsets[directionIndex]!;
    const nx = x + dx;
    const ny = y + dy;
    if (ny < 0 || ny >= height) continue;
    fn(wrapX(nx, width), ny, directionIndex);
  }
}

export function getHexRadiusIndicesOddQ(
  centerIndex: number,
  width: number,
  height: number,
  radius: number
): number[] {
  const size = Math.max(0, (width | 0) * (height | 0));
  const start = centerIndex | 0;
  const maxDistance = Math.max(0, radius | 0);
  if (start < 0 || start >= size || width <= 0 || height <= 0) return [];
  if (maxDistance === 0) return [start];

  const visited = new Uint8Array(size);
  const distances = new Int16Array(size);
  const queue: number[] = [start];
  const out: number[] = [start];
  visited[start] = 1;

  let head = 0;
  while (head < queue.length) {
    const idx = queue[head++]!;
    const distance = distances[idx] ?? 0;
    if (distance >= maxDistance) continue;

    const y = (idx / width) | 0;
    const x = idx - y * width;
    for (const neighbor of getHexNeighborIndicesOddQ(x, y, width, height)) {
      if (visited[neighbor] === 1) continue;
      visited[neighbor] = 1;
      distances[neighbor] = distance + 1;
      queue.push(neighbor);
      out.push(neighbor);
    }
  }

  return out;
}
