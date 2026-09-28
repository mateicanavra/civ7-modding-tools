import { forEachHexNeighborOddQ } from "@swooper/mapgen-core/lib/grid";

/** Physical support for terrain classification, measured against wrapped radius-one land neighbors. */
export function computeLandNeighborRelief(params: {
  index: number;
  width: number;
  height: number;
  elevation: ArrayLike<number>;
  landMask: ArrayLike<number>;
}): { upward: number; downward: number } {
  const { index, width, height, elevation, landMask } = params;
  let upward = 0;
  let downward = 0;
  if (landMask[index] !== 1) return { upward, downward };

  const base = elevation[index] ?? 0;
  forEachHexNeighborOddQ(index % width, Math.floor(index / width), width, height, (nx, ny) => {
    const neighbor = ny * width + nx;
    if (landMask[neighbor] !== 1) return;
    const difference = (elevation[neighbor] ?? base) - base;
    upward = Math.max(upward, difference);
    downward = Math.max(downward, -difference);
  });
  return { upward, downward };
}
