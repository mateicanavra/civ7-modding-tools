import { idx } from "@swooper/mapgen-core/lib/grid";

/**
 * Chooses a cardinal direction for the advisory upwind-barrier visualization.
 * Its calm-cell latitude convention does not control vector moisture transport or precipitation.
 */
function upwindOffset(
  u: number,
  v: number,
  absoluteLatitude: number
): Readonly<{ dx: number; dy: number }> {
  if (Math.abs(u) >= Math.abs(v)) {
    if (u !== 0) return { dx: u > 0 ? 1 : -1, dy: 0 };
  } else if (v !== 0) {
    return { dx: 0, dy: v > 0 ? 1 : -1 };
  }
  return absoluteLatitude < 30 || absoluteLatitude >= 60 ? { dx: -1, dy: 0 } : { dx: 1, dy: 0 };
}

/**
 * Finds the first qualifying terrain barrier along a bounded cardinal wind trace.
 * This advisory trace is not the precipitation algorithm's continuous uplift gradient.
 * Elevation and the legacy barrierElevationM threshold are absolute model relief units, not meters.
 */
export function upwindBarrierDistance(
  x: number,
  y: number,
  width: number,
  height: number,
  elevation: ArrayLike<number>,
  landMask: ArrayLike<number>,
  windU: ArrayLike<number>,
  windV: ArrayLike<number>,
  latitudeByRow: ArrayLike<number>,
  steps: number,
  options: Readonly<{ barrierElevationM: number }>
): number {
  let currentX = x;
  let currentY = y;
  const maxSteps = Math.max(1, steps | 0);

  for (let step = 1; step <= maxSteps; step += 1) {
    const index = idx(currentX, currentY, width);
    const direction = upwindOffset(
      windU[index] ?? 0,
      windV[index] ?? 0,
      Math.abs(latitudeByRow[currentY] ?? 0)
    );
    const nextX = currentX + direction.dx;
    const nextY = currentY + direction.dy;
    if (nextX < 0 || nextX >= width || nextY < 0 || nextY >= height) break;

    const nextIndex = idx(nextX, nextY, width);
    if (landMask[nextIndex] === 1 && (elevation[nextIndex] ?? 0) >= options.barrierElevationM) {
      return step;
    }
    currentX = nextX;
    currentY = nextY;
  }

  return 0;
}
