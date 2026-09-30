import { forEachHexNeighborOddQ } from "@swooper/mapgen-core/lib/grid";

/** Measures shore distance inside each certified wet body; -1 means no reachable physical shore. */
export function computeCertifiedLakeShoreDistance(args: {
  readonly width: number;
  readonly height: number;
  readonly landMask: ArrayLike<number>;
  readonly lakeMask: ArrayLike<number>;
  readonly bodyId: ArrayLike<number>;
  readonly waterSurface: readonly number[];
}): Int32Array {
  const { width, height, landMask, lakeMask, bodyId, waterSurface } = args;
  const size = width * height;
  if (waterSurface.length !== size) {
    throw new Error("Certified lotus habitat requires map-grid waterSurface.");
  }
  for (let cell = 0; cell < size; cell++) {
    if (landMask[cell] !== 0 && landMask[cell] !== 1) {
      throw new Error("Certified lotus habitat requires binary physical landMask.");
    }
    if (lakeMask[cell] !== 0 && lakeMask[cell] !== 1) {
      throw new Error("Certified lotus habitat requires binary lakeMask.");
    }
    const id = bodyId[cell]!;
    if (lakeMask[cell] === 1 ? id <= 0 : id !== 0) {
      throw new Error("Certified lotus habitat requires bodyId to match the lake footprint.");
    }
  }

  const distance = new Int32Array(size).fill(-1);
  const queue: number[] = [];
  for (let cell = 0; cell < size; cell++) {
    if (lakeMask[cell] !== 1) continue;
    forEachHexNeighborOddQ(cell % width, Math.floor(cell / width), width, height, (nx, ny) => {
      const neighbor = ny * width + nx;
      if (distance[cell] === -1 && landMask[neighbor] === 1 && lakeMask[neighbor] === 0) {
        distance[cell] = 0;
        queue.push(cell);
      }
    });
  }

  // A marine edge or another wet body cannot seed shore or carry a body's distance field.
  for (let cursor = 0; cursor < queue.length; cursor++) {
    const cell = queue[cursor]!;
    forEachHexNeighborOddQ(cell % width, Math.floor(cell / width), width, height, (nx, ny) => {
      const neighbor = ny * width + nx;
      if (
        distance[neighbor] === -1 &&
        lakeMask[neighbor] === 1 &&
        bodyId[neighbor] === bodyId[cell]
      ) {
        distance[neighbor] = distance[cell]! + 1;
        queue.push(neighbor);
      }
    });
  }

  return distance;
}
