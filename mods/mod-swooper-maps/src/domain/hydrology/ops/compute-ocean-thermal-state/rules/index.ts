import {
  forEachHexNeighborOddQWithDirection,
  getHexNeighborDirectionVectorsOddQ,
} from "@swooper/mapgen-core/lib/grid";

type Upcurrent = Readonly<{ i0: number; w0: number; i1: number; w1: number }>;

function selectUpcurrent(
  x: number,
  y: number,
  width: number,
  height: number,
  isWaterMask: Uint8Array,
  flowX: number,
  flowY: number,
  secondaryWeightMin: number
): Upcurrent {
  // Neighbor geometry comes from the shared odd-R primitive (parity keyed on the
  // ROW, `y & 1`), so the donor selection matches the live engine adjacency. The
  // previous inlined odd-Q tables keyed on the COLUMN (`x & 1`) and the row-0
  // delta builder were geometrically degenerate under the odd-R projection.
  const dirs = getHexNeighborDirectionVectorsOddQ((y & 1) === 1);

  // Upcurrent is opposite direction of the flow.
  const ux = -flowX;
  const uy = -flowY;

  let bestI0 = -1;
  let bestI1 = -1;
  let s0 = 0;
  let s1 = 0;

  forEachHexNeighborOddQWithDirection(x, y, width, height, (nx, ny, k) => {
    const ni = ny * width + nx;
    if ((isWaterMask[ni] ?? 0) !== 1) return;
    const d = dirs[k];
    const score = ux * d.x + uy * d.y;
    if (score <= 0) return;
    if (score > s0) {
      s1 = s0;
      bestI1 = bestI0;
      s0 = score;
      bestI0 = ni;
    } else if (score > s1) {
      s1 = score;
      bestI1 = ni;
    }
  });

  if (bestI0 < 0) {
    const i0 = y * width + x;
    return { i0, w0: 1, i1: i0, w1: 0 };
  }

  const i0 = bestI0;

  if (bestI1 < 0 || s1 <= 0) {
    return { i0, w0: 1, i1: i0, w1: 0 };
  }

  const sum = s0 + s1;
  const w0 = sum > 1e-6 ? s0 / sum : 1;
  const w1 = sum > 1e-6 ? s1 / sum : 0;
  if (w1 < secondaryWeightMin) {
    return { i0, w0: 1, i1: i0, w1: 0 };
  }

  const i1 = bestI1;
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
  shelfMask: Uint8Array,
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
  const shelfDiffusionScale = 1.35;

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
        const up = selectUpcurrent(
          x,
          y,
          width,
          height,
          isWaterMask,
          flowX,
          flowY,
          secondaryWeightMin
        );
        const advected = (sst[up.i0] ?? 0) * up.w0 + (sst[up.i1] ?? 0) * up.w1;

        // Simple diffusion: average neighbor SST over water and mix in. Uses the
        // shared odd-R neighbor iterator (parity keyed on the ROW) so the stencil
        // matches the live engine adjacency.
        let sum = 0;
        let w = 0;
        forEachHexNeighborOddQWithDirection(x, y, width, height, (nx, ny) => {
          const j = ny * width + nx;
          if (isWaterMask[j] !== 1) return;
          sum += sst[j] ?? 0;
          w += 1;
        });
        const neighborAvg = w > 0 ? sum / w : advected;
        const tileDiffusion =
          shelfMask[i] === 1 ? Math.min(1, diffusion * shelfDiffusionScale) : diffusion;
        next[i] = lerp(advected, neighborAvg, tileDiffusion);
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
