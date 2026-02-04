import { createStrategy } from "@swooper/mapgen-core/authoring";
import { idx } from "@swooper/mapgen-core";
import { projectOddqToHexSpace, wrapX } from "@swooper/mapgen-core/lib/grid";

import TransportMoistureContract from "../contract.js";
import { clamp01 } from "../rules/index.js";

type Vec2 = Readonly<{ x: number; y: number }>;

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

function getNeighborDeltaHexSpaceFrom(baseX: number, dx: number, dy: number): Vec2 {
  const base = projectOddqToHexSpace(baseX, 0);
  const p = projectOddqToHexSpace(baseX + dx, dy);
  return { x: p.x - base.x, y: p.y - base.y };
}

const HEX_DELTAS_ODD: readonly Vec2[] = OFFSETS_ODD.map(([dx, dy]) => getNeighborDeltaHexSpaceFrom(1, dx, dy));
const HEX_DELTAS_EVEN: readonly Vec2[] = OFFSETS_EVEN.map(([dx, dy]) => getNeighborDeltaHexSpaceFrom(0, dx, dy));

type Upwind = Readonly<{ i0: number; w0: number; i1: number; w1: number }>;

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
  const isOdd = (x & 1) === 1;
  const offsets = isOdd ? OFFSETS_ODD : OFFSETS_EVEN;
  const deltas = isOdd ? HEX_DELTAS_ODD : HEX_DELTAS_EVEN;

  // Upwind direction is opposite the wind.
  const ux = -windX;
  const uy = -windY;

  let best0 = -1;
  let best1 = -1;
  let s0 = 0;
  let s1 = 0;

  for (let k = 0; k < offsets.length; k++) {
    const [dx, dy] = offsets[k];
    const ny = y + dy;
    if (ny < 0 || ny >= height) continue;
    const d = deltas[k];
    const score = ux * d.x + uy * d.y;
    if (score <= 0) continue;
    if (score > s0) {
      s1 = s0;
      best1 = best0;
      s0 = score;
      best0 = k;
    } else if (score > s1) {
      s1 = score;
      best1 = k;
    }
  }

  if (best0 < 0) {
    // Fallback to coarse lat-based zonal.
    const dx = absLatDeg < 30 || absLatDeg >= 60 ? -1 : 1;
    const ny = y;
    const nx = wrapX(x + dx, width);
    const i0 = idx(nx, ny, width);
    return { i0, w0: 1, i1: i0, w1: 0 };
  }

  const [dx0, dy0] = offsets[best0];
  const nx0 = wrapX(x + dx0, width);
  const ny0 = y + dy0;
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

  const [dx1, dy1] = offsets[best1];
  const nx1 = wrapX(x + dx1, width);
  const ny1 = y + dy1;
  const i1 = idx(nx1, ny1, width);

  return { i0, w0, i1, w1 };
}

export const defaultStrategy = createStrategy(TransportMoistureContract, "default", {
  run: (input, config) => {
    const width = input.width | 0;
    const height = input.height | 0;
    const size = Math.max(0, width * height);

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
