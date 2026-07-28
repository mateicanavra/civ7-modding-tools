function wrapX(x: number, width: number): number {
  return ((x % width) + width) % width;
}

/** Visits each in-bounds odd-row neighbor once while wrapping the map's X axis. */
export function forEachHexNeighborOddQ(
  x: number,
  y: number,
  width: number,
  height: number,
  callback: (nx: number, ny: number) => void
): void {
  // Civ7 engine grid is odd-R (row-offset): neighbor parity keyed on the ROW.
  // Must match the canonical table in @swooper/mapgen-core hex-oddq. Even rows
  // take the west diagonals; odd rows take the east diagonals. (Legacy `OddQ`
  // name retained pending a mechanical rename.)
  const oddRow = y & 1;
  const deltas =
    oddRow === 1
      ? [
          [1, 0],
          [1, 1],
          [0, 1],
          [1, -1],
          [-1, 0],
          [0, -1],
        ]
      : [
          [-1, 1],
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
