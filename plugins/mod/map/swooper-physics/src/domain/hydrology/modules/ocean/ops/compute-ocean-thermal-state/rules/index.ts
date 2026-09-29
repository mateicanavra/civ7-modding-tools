import {
  forEachHexNeighborOddQWithDirection,
  getHexNeighborDirectionVectorsOddQ,
} from "@swooper/mapgen-core/lib/grid";

type Upcurrent = Readonly<{ i0: number; w0: number; i1: number; w1: number }>;

function angularDirections(isOddRow: boolean) {
  return getHexNeighborDirectionVectorsOddQ(isOddRow)
    .map((vector, directionIndex) => ({ vector, directionIndex }))
    .sort((a, b) => Math.atan2(a.vector.y, a.vector.x) - Math.atan2(b.vector.y, b.vector.x));
}

const EVEN_ROW_DIRECTIONS = angularDirections(false);
const ODD_ROW_DIRECTIONS = angularDirections(true);

function selectUpcurrent(
  x: number,
  y: number,
  width: number,
  height: number,
  isWaterMask: ArrayLike<number>,
  flowX: number,
  flowY: number
): Upcurrent {
  const self = y * width + x;
  if (flowX === 0 && flowY === 0) return { i0: self, w0: 1, i1: self, w1: 0 };

  // The legacy OddQ helpers implement odd-R geometry, keyed by row parity.
  // Find the enclosing angular sector before considering coastlines or bounded Y edges.
  const directions = (y & 1) === 1 ? ODD_ROW_DIRECTIONS : EVEN_ROW_DIRECTIONS;
  const ux = -flowX;
  const uy = -flowY;
  for (let k = 0; k < directions.length; k++) {
    const d0 = directions[k]!;
    const d1 = directions[(k + 1) % directions.length]!;
    const a = ux * d1.vector.y - uy * d1.vector.x;
    const b = d0.vector.x * uy - d0.vector.y * ux;
    if (a < 0 || b < 0) continue;

    const sum = a + b;
    let i0 = self;
    let i1 = self;
    // Blocked shares stay at self; surviving donors never absorb their weight.
    // Keep direction aliases on narrow periodic grids, including aliases of self.
    forEachHexNeighborOddQWithDirection(x, y, width, height, (nx, ny, directionIndex) => {
      const neighbor = ny * width + nx;
      if (isWaterMask[neighbor] !== 1) return;
      if (directionIndex === d0.directionIndex) i0 = neighbor;
      if (directionIndex === d1.directionIndex) i1 = neighbor;
    });
    return { i0, w0: a / sum, i1, w1: b / sum };
  }
  throw new Error("Ocean current has no enclosing hex direction sector.");
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clampFinite(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

/**
 * Advects a latitudinal sea-surface-temperature baseline through the authored ocean-current field.
 *
 * Each iteration interpolates the adjacent rays bracketing the upcurrent direction, retaining
 * blocked shares at self, then diffuses in hex space with a stronger shelf response. Advection
 * depends on direction, not current magnitude; this is not a physical speed/time integration.
 * Land temperatures remain zero, and sea ice is classified from the transported SST.
 *
 * @param width - Number of tile columns in every per-tile field.
 * @param height - Number of tile rows in every per-tile field.
 * @param latitudeByRow - Signed latitude in degrees used to seed baseline SST.
 * @param isWaterMask - Binary mask restricting advection, diffusion, and sea ice to water.
 * @param shelfMask - Binary mask selecting the stronger shallow-water diffusion response.
 * @param currentU - Quantized zonal current component per tile.
 * @param currentV - Quantized meridional current component per tile.
 * @param options - SST endpoints, iteration/diffusion controls, and ice threshold.
 * @returns Transported SST in Celsius and a threshold-derived binary sea-ice mask.
 */
export function computeOceanThermalState(
  width: number,
  height: number,
  latitudeByRow: ArrayLike<number>,
  isWaterMask: ArrayLike<number>,
  shelfMask: ArrayLike<number>,
  currentU: ArrayLike<number>,
  currentV: ArrayLike<number>,
  options: Readonly<{
    equatorTempC: number;
    poleTempC: number;
    advectIters: number;
    diffusion: number;
    seaIceThresholdC: number;
  }>
): { sstC: Float32Array; seaIceMask: Uint8Array } {
  const size = width * height;
  const sst = new Float32Array(size);
  const next = new Float32Array(size);
  const seaIceMask = new Uint8Array(size);

  const equator = options.equatorTempC;
  const pole = options.poleTempC;
  const diffusion = clampFinite(options.diffusion, 0, 1);
  const advectIters = Math.max(0, options.advectIters | 0);
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
          flowY
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
