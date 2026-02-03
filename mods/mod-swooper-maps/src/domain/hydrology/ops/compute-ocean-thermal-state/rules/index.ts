import { idx } from "@swooper/mapgen-core";
import { projectOddqToHexSpace, wrapX } from "@swooper/mapgen-core/lib/grid";

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

type Upcurrent = Readonly<{ i0: number; w0: number; i1: number; w1: number }>;

function selectUpcurrent(
  x: number,
  y: number,
  width: number,
  height: number,
  flowX: number,
  flowY: number,
  secondaryWeightMin: number
): Upcurrent {
  const isOdd = (x & 1) === 1;
  const offsets = isOdd ? OFFSETS_ODD : OFFSETS_EVEN;
  const deltas = isOdd ? HEX_DELTAS_ODD : HEX_DELTAS_EVEN;

  // Upcurrent is opposite direction of the flow.
  const ux = -flowX;
  const uy = -flowY;

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
    const i0 = idx(x, y, width);
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

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clampFinite(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

export function computeOceanThermalState(
  width: number,
  height: number,
  latitudeByRow: Float32Array,
  isWaterMask: Uint8Array,
  currentU: Int8Array,
  currentV: Int8Array,
  options: Readonly<{
    equatorTempC: number;
    poleTempC: number;
    advectIters: number;
    diffusion: number;
    secondaryWeightMin: number;
    seaIceThresholdC: number;
  }>
): { sstC: Float32Array; seaIceMask: Uint8Array } {
  const size = Math.max(0, width * height);
  const sst = new Float32Array(size);
  const next = new Float32Array(size);
  const seaIceMask = new Uint8Array(size);

  const equator = options.equatorTempC;
  const pole = options.poleTempC;
  const diffusion = clampFinite(options.diffusion, 0, 1);
  const advectIters = Math.max(0, options.advectIters | 0);
  const secondaryWeightMin = clampFinite(options.secondaryWeightMin, 0, 1);
  const seaIceThresholdC = options.seaIceThresholdC;

  // Baseline SST from latitude (symmetric).
  for (let y = 0; y < height; y++) {
    const latAbs = Math.abs(latitudeByRow[y] ?? 0);
    const t = Math.max(0, Math.min(1, latAbs / 90));
    const base = lerp(equator, pole, t);
    const row = y * width;
    for (let x = 0; x < width; x++) {
      const i = row + x;
      if (isWaterMask[i] === 1) sst[i] = base;
      else sst[i] = 0;
    }
  }

  // Advect/diffuse water-only.
  for (let iter = 0; iter < advectIters; iter++) {
    for (let y = 0; y < height; y++) {
      const row = y * width;
      for (let x = 0; x < width; x++) {
        const i = row + x;
        if (isWaterMask[i] !== 1) {
          next[i] = 0;
          continue;
        }

        const flowX = currentU[i] ?? 0;
        const flowY = currentV[i] ?? 0;
        const up = selectUpcurrent(x, y, width, height, flowX, flowY, secondaryWeightMin);
        const advected = (sst[up.i0] ?? 0) * up.w0 + (sst[up.i1] ?? 0) * up.w1;

        // Simple diffusion: average neighbor SST over water and mix in.
        const isOdd = (x & 1) === 1;
        const offsets = isOdd ? OFFSETS_ODD : OFFSETS_EVEN;
        let sum = 0;
        let w = 0;
        for (let k = 0; k < offsets.length; k++) {
          const [dx, dy] = offsets[k];
          const ny = y + dy;
          if (ny < 0 || ny >= height) continue;
          const nx = wrapX(x + dx, width);
          const j = idx(nx, ny, width);
          if (isWaterMask[j] !== 1) continue;
          sum += sst[j] ?? 0;
          w += 1;
        }
        const neighborAvg = w > 0 ? sum / w : advected;
        next[i] = lerp(advected, neighborAvg, diffusion);
      }
    }
    sst.set(next);
  }

  for (let i = 0; i < size; i++) {
    if (isWaterMask[i] !== 1) {
      seaIceMask[i] = 0;
      continue;
    }
    seaIceMask[i] = (sst[i] ?? 0) <= seaIceThresholdC ? 1 : 0;
  }

  return { sstC: sst, seaIceMask } as const;
}
