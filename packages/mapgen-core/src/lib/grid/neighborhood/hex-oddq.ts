import { wrapX } from "@mapgen/lib/grid/wrap.js";

// Civ7 plot-grid adjacency. The engine grid is pointy-top, ROW-offset (odd-R):
// neighbor parity is keyed on the ROW (`y & 1`), with the two parity-dependent
// diagonals on the west column for even rows and the east column for odd rows.
// Confirmed against the live engine's `getAdjacentPlotLocation` adjacency
// (even row -> (-1,-1),(-1,1); odd row -> (1,-1),(1,1)). The four orthogonal-ish
// neighbors (`(-1,0),(1,0),(0,-1),(0,1)`) are common to both parities.
//
// NOTE: the `OddQ` symbol names are legacy (the grid was historically and
// incorrectly modeled as column-offset odd-Q); they are scheduled for a
// mechanical rename to `OddR`. The implementation below is odd-R.
const OFFSETS_ODD_ROW: readonly (readonly [number, number])[] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 1],
];

const OFFSETS_EVEN_ROW: readonly (readonly [number, number])[] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
  [-1, -1],
  [-1, 1],
];

/**
 * Allocates row-major indices for the valid neighbors of a Civ7 odd-row-offset hex tile.
 * Despite the legacy `OddQ` name, parity is keyed by row; X wraps, Y clips, and direction order is stable.
 * Narrow periodic grids may produce duplicate indices because direction aliases are not deduplicated.
 */
export function getHexNeighborIndicesOddQ(
  x: number,
  y: number,
  width: number,
  height: number
): number[] {
  const isOddRow = (y & 1) === 1;
  const offsets = isOddRow ? OFFSETS_ODD_ROW : OFFSETS_EVEN_ROW;
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

/**
 * Visits Civ7 odd-row-offset hex neighbors without allocating an index array.
 * Callback coordinates wrap across X and omit neighbors beyond the bounded Y edges.
 * Distinct directions may revisit the same tile on a narrow periodic grid.
 */
export function forEachHexNeighborOddQ(
  x: number,
  y: number,
  width: number,
  height: number,
  fn: (nx: number, ny: number) => void
): void {
  const isOddRow = (y & 1) === 1;
  const offsets = isOddRow ? OFFSETS_ODD_ROW : OFFSETS_EVEN_ROW;

  for (const [dx, dy] of offsets) {
    const nx = x + dx;
    const ny = y + dy;
    if (ny < 0 || ny >= height) continue;
    fn(wrapX(nx, width), ny);
  }
}

/**
 * Visits hex neighbors with their canonical zero-based direction slot.
 * Y-edge omissions leave gaps in direction indices rather than renumbering the remaining neighbors.
 */
export function forEachHexNeighborOddQWithDirection(
  x: number,
  y: number,
  width: number,
  height: number,
  fn: (nx: number, ny: number, directionIndex: number) => void
): void {
  const isOddRow = (y & 1) === 1;
  const offsets = isOddRow ? OFFSETS_ODD_ROW : OFFSETS_EVEN_ROW;

  for (let directionIndex = 0; directionIndex < offsets.length; directionIndex++) {
    const [dx, dy] = offsets[directionIndex]!;
    const nx = x + dx;
    const ny = y + dy;
    if (ny < 0 || ny >= height) continue;
    fn(wrapX(nx, width), ny, directionIndex);
  }
}

/**
 * Allocates the unique tiles within a graph radius, including the center, in deterministic BFS order.
 * The search uses X-periodic, Y-bounded odd-row adjacency; invalid extents or centers return `[]`,
 * while a nonpositive radius returns only the admitted center.
 */
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
