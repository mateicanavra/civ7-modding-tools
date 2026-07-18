import { idx } from "@swooper/mapgen-core";
import { createStrategy } from "@swooper/mapgen-core/authoring";
import {
  bestHexNeighborDirectionIndexOddQ,
  forEachHexNeighborOddQWithDirection,
  getHexNeighborDirectionVectorsOddQ,
  wrapX,
} from "@swooper/mapgen-core/lib/grid";

import TransportMoistureContract from "../contract.js";
import { clamp01 } from "../rules/index.js";

type Upwind = Readonly<{ i0: number; w0: number; i1: number; w1: number }>;

// Upwind moisture donor selection over the engine's odd-R hex neighborhood. Uses
// the shared neighbor iterator + hex-space direction vectors (parity keyed on the
// ROW, `y & 1`) so this matches the live engine adjacency exactly. The previous
// inlined odd-Q tables + row-0 delta builder keyed parity on the COLUMN (`x & 1`)
// and projected the base at row 0, producing a geometrically degenerate neighbor
// under the odd-R projection; routing through the shared primitive removes that
// whole class of drift.
function selectUpwind(
  x: number,
  y: number,
  width: number,
  height: number,
  windX: number,
  windY: number,
  absLatDeg: number,
  secondaryWeightMin: number
): Upwind {
  const isOddRow = (y & 1) === 1;
  const dirs = getHexNeighborDirectionVectorsOddQ(isOddRow);

  // Upwind direction is opposite the wind.
  const ux = -windX;
  const uy = -windY;

  // Primary donor: the neighbor direction best aligned with the upwind (negated
  // wind) vector. Resolve the chosen direction index to a bounds-checked neighbor.
  const best0 = bestHexNeighborDirectionIndexOddQ({ x: ux, y: uy }, isOddRow);

  let nx0 = -1;
  let ny0 = -1;
  let s0 = 0;
  let best1 = -1;
  let nx1 = -1;
  let ny1 = -1;
  let s1 = 0;
  forEachHexNeighborOddQWithDirection(x, y, width, height, (nx, ny, k) => {
    const d = dirs[k];
    const score = ux * d.x + uy * d.y;
    if (k === best0) {
      // Anchor the primary donor to the shared selection; only adopt it when its
      // upwind alignment is positive (matching the original `score > 0` gate).
      if (score > 0) {
        nx0 = nx;
        ny0 = ny;
        s0 = score;
      }
      return;
    }
    if (score <= 0) return;
    if (score > s1) {
      s1 = score;
      best1 = k;
      nx1 = nx;
      ny1 = ny;
    }
  });

  if (nx0 < 0) {
    // Fallback to coarse lat-based zonal.
    const dx = absLatDeg < 30 || absLatDeg >= 60 ? -1 : 1;
    const ny = y;
    const nx = wrapX(x + dx, width);
    const i0 = idx(nx, ny, width);
    return { i0, w0: 1, i1: i0, w1: 0 };
  }

  const i0 = idx(nx0, ny0, width);

  if (best1 < 0 || s1 <= 0) {
    return { i0, w0: 1, i1: i0, w1: 0 };
  }

  const sum = s0 + s1;
  const w0 = sum > 1e-6 ? s0 / sum : 1;
  const w1 = sum > 1e-6 ? s1 / sum : 0;
  if (w1 < secondaryWeightMin) {
    return { i0, w0: 1, i1: i0, w1: 0 };
  }

  const i1 = idx(nx1, ny1, width);

  return { i0, w0, i1, w1 };
}

export const defaultStrategy = createStrategy(TransportMoistureContract, "default", {
  run: (input, config) => {
    const width = input.width;
    const height = input.height;
    const size = width * height;

    if (!(input.latitudeByRow instanceof Float32Array) || input.latitudeByRow.length !== height) {
      throw new Error("[Hydrology] Invalid latitudeByRow for hydrology/transport-moisture.");
    }
    if (!(input.landMask instanceof Uint8Array) || input.landMask.length !== size) {
      throw new Error("[Hydrology] Invalid landMask for hydrology/transport-moisture.");
    }
    if (!(input.windU instanceof Int8Array) || input.windU.length !== size) {
      throw new Error("[Hydrology] Invalid windU for hydrology/transport-moisture.");
    }
    if (!(input.windV instanceof Int8Array) || input.windV.length !== size) {
      throw new Error("[Hydrology] Invalid windV for hydrology/transport-moisture.");
    }
    if (!(input.evaporation instanceof Float32Array) || input.evaporation.length !== size) {
      throw new Error("[Hydrology] Invalid evaporation for hydrology/transport-moisture.");
    }

    const iterations = config.iterations | 0;
    const advection = config.advection;
    const retention = config.retention;
    const secondaryWeightMin = config.secondaryWeightMin;

    let prev = new Float32Array(size);
    let next = new Float32Array(size);
    for (let i = 0; i < size; i++) prev[i] = clamp01(input.evaporation[i] ?? 0);

    for (let iter = 0; iter < iterations; iter++) {
      for (let y = 0; y < height; y++) {
        const absLat = Math.abs(input.latitudeByRow[y] ?? 0);
        const row = y * width;
        for (let x = 0; x < width; x++) {
          const i = row + x;
          const local = input.evaporation[i] ?? 0;
          const windX = input.windU[i] | 0;
          const windY = input.windV[i] | 0;

          const up = selectUpwind(x, y, width, height, windX, windY, absLat, secondaryWeightMin);
          const advected = (prev[up.i0] ?? 0) * up.w0 + (prev[up.i1] ?? 0) * up.w1;
          next[i] = clamp01((local + advected * advection) * retention);
        }
      }
      const swap = prev;
      prev = next;
      next = swap;
    }

    return { humidity: prev } as const;
  },
});
