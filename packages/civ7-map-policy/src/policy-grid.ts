export function wrapX(x: number, width: number): number {
  return ((x % width) + width) % width;
}

export function forEachHexNeighborOddQ(
  x: number,
  y: number,
  width: number,
  height: number,
  callback: (nx: number, ny: number) => void
): void {
  const odd = x & 1;
  const deltas =
    odd === 1
      ? [
          [1, 0],
          [1, 1],
          [0, 1],
          [-1, 1],
          [-1, 0],
          [0, -1],
        ]
      : [
          [1, -1],
          [1, 0],
          [0, 1],
          [-1, 0],
          [-1, -1],
          [0, -1],
        ];

  for (const [dx, dy] of deltas) {
    const nx = wrapX(x + dx, width);
    const ny = y + dy;
    if (ny < 0 || ny >= height) continue;
    callback(nx, ny);
  }
}

export function computeHexDistanceToMask(params: {
  mask: Uint8Array;
  width: number;
  height: number;
  maxDistance: number;
}): Uint8Array {
  const { mask, width, height } = params;
  const size = width * height;
  if (mask.length !== size) {
    throw new Error(`[policy-grid] mask length ${mask.length} does not match ${size}.`);
  }

  const maxDistance = Math.max(0, params.maxDistance | 0);
  const distance = new Uint8Array(size).fill(255);
  const queue: number[] = [];
  for (let i = 0; i < size; i++) {
    if (mask[i] !== 1) continue;
    distance[i] = 0;
    queue.push(i);
  }

  for (let cursor = 0; cursor < queue.length; cursor++) {
    const idx = queue[cursor]!;
    const currentDistance = distance[idx]!;
    if (currentDistance >= maxDistance) continue;
    const y = (idx / width) | 0;
    const x = idx - y * width;
    forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
      const ni = ny * width + nx;
      if (distance[ni]! <= currentDistance + 1) return;
      distance[ni] = currentDistance + 1;
      queue.push(ni);
    });
  }

  return distance;
}
