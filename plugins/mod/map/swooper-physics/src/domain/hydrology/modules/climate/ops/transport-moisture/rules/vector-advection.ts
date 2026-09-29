import {
  bracketHexNeighborDirectionsOddQ,
  forEachHexNeighborOddQWithDirection,
} from "@swooper/mapgen-core/lib/grid";
import { clamp01 } from "@swooper/mapgen-core/lib/math";

function sampleUpwind(
  x: number,
  y: number,
  width: number,
  height: number,
  windX: number,
  windY: number,
  humidity: Float32Array
): number {
  const self = y * width + x;
  const bracket = bracketHexNeighborDirectionsOddQ({ x: -windX, y: -windY }, (y & 1) === 1);
  if (!bracket) return humidity[self] ?? 0;

  let i0 = self;
  let i1 = self;
  // Air crosses land and water. Only missing bounded-Y donors retain their share at self.
  forEachHexNeighborOddQWithDirection(x, y, width, height, (nx, ny, directionIndex) => {
    if (directionIndex === bracket.direction0) i0 = ny * width + nx;
    if (directionIndex === bracket.direction1) i1 = ny * width + nx;
  });
  return (humidity[i0] ?? 0) * bracket.weight0 + (humidity[i1] ?? 0) * bracket.weight1;
}

/**
 * Evolves humidity under the supplied wind directions with fixed passes and local source injection.
 * Calm wind and unavailable upwind shares sample self rather than inventing latitude-based flow.
 * Advection remains direction-only; retention, clamping, and source injection are not a mass budget.
 */
export function advectMoisture(params: Readonly<{
  width: number;
  height: number;
  windU: ArrayLike<number>;
  windV: ArrayLike<number>;
  evaporation: ArrayLike<number>;
  iterations: number;
  advection: number;
  retention: number;
}>): Float32Array {
  const { width, height, windU, windV, evaporation, advection, retention } = params;
  const size = width * height;
  const iterations = params.iterations | 0;
  let prev = new Float32Array(size);
  let next = new Float32Array(size);
  for (let i = 0; i < size; i++) prev[i] = clamp01(evaporation[i] ?? 0);

  for (let iter = 0; iter < iterations; iter++) {
    for (let y = 0; y < height; y++) {
      const row = y * width;
      for (let x = 0; x < width; x++) {
        const i = row + x;
        const local = evaporation[i] ?? 0;
        const advected = sampleUpwind(x, y, width, height, windU[i] | 0, windV[i] | 0, prev);
        next[i] = clamp01((local + advected * advection) * retention);
      }
    }
    const swap = prev;
    prev = next;
    next = swap;
  }
  return prev;
}
