import { forEachHexNeighborOddQ } from "@swooper/mapgen-core/lib/grid";
import { clamp, clampInt16, roundHalfAwayFromZero } from "@swooper/mapgen-core/lib/math";

type WorldAge = "young" | "mature" | "old";

type GeomorphicCycleConfig = Readonly<{
  worldAge: WorldAge;
  geomorphology: Readonly<{
    fluvial: Readonly<{ rate: number; m: number; n: number }>;
    diffusion: Readonly<{ rate: number }>;
    deposition: Readonly<{ rate: number }>;
    eras: number;
  }>;
}>;

const WORLD_AGE_SCALE: Record<string, number> = {
  young: 0.7,
  mature: 1.0,
  old: 1.3,
};

/**
 * Resolves the world-age scaling multiplier.
 */
function resolveWorldAgeScale(worldAge: WorldAge): number {
  return WORLD_AGE_SCALE[worldAge];
}

/**
 * Evolves elevation and sediment through the configured eras while preserving land-water identity.
 *
 * The transition never mutates or aliases admitted inputs. It accumulates floating-point process
 * deltas across every era, then quantizes and clamps complete product buffers exactly once.
 */
export function evolveGeomorphicSurface(params: {
  width: number;
  height: number;
  elevation: Int16Array;
  seaLevel: number;
  flowDir: Int32Array;
  flowAccum: Float32Array;
  erodibility: Float32Array;
  sedimentDepth: Float32Array;
  landMask: Uint8Array;
  config: GeomorphicCycleConfig;
}) {
  const {
    width,
    height,
    elevation,
    seaLevel,
    flowDir,
    flowAccum,
    erodibility,
    sedimentDepth,
    landMask,
    config,
  } = params;
  const size = elevation.length;

  let maxFlow = 1;
  for (let i = 0; i < size; i++) {
    if (flowAccum[i] > maxFlow) maxFlow = flowAccum[i];
  }

  const ageScale = resolveWorldAgeScale(config.worldAge);
  const fluvial = config.geomorphology.fluvial;
  const diffusion = config.geomorphology.diffusion;
  const deposition = config.geomorphology.deposition;
  const eras = config.geomorphology.eras;

  const elevationDelta = new Float32Array(size);
  const sedimentDelta = new Float32Array(size);

  const scratchElevation = new Float32Array(size);
  const scratchSediment = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    scratchElevation[i] = elevation[i] ?? 0;
    scratchSediment[i] = sedimentDepth[i] ?? 0;
  }

  const erosionRate = fluvial.rate * ageScale;
  const diffusionRate = diffusion.rate * ageScale;
  const depositionRate = deposition.rate * ageScale;

  const m = fluvial.m;
  const n = fluvial.n;

  for (let era = 0; era < eras; era++) {
    let maxDrop = 1;
    for (let i = 0; i < size; i++) {
      if (landMask[i] !== 1) continue;
      const dest = flowDir[i] ?? -1;
      if (dest < 0 || dest >= size) continue;
      const drop = (scratchElevation[i] ?? 0) - (scratchElevation[dest] ?? 0);
      if (drop > maxDrop) maxDrop = drop;
    }

    const elevationDeltaEra = new Float32Array(size);
    const sedimentDeltaEra = new Float32Array(size);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x;
        const elev = scratchElevation[i] ?? 0;

        const isLand = landMask[i] === 1;

        let diffusionDelta = 0;
        if (isLand && diffusionRate > 0) {
          let neighborSum = elev;
          let neighborCount = 1;
          forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
            const ni = ny * width + nx;
            neighborSum += scratchElevation[ni] ?? 0;
            neighborCount++;
          });
          const avg = neighborSum / neighborCount;
          diffusionDelta = (avg - elev) * diffusionRate;
        }

        const dest = flowDir[i] ?? -1;
        const aNorm = clamp((flowAccum[i] ?? 0) / maxFlow, 0, 1);
        const discharge = Math.pow(aNorm, m);
        const drop =
          dest >= 0 && dest < size ? Math.max(0, elev - (scratchElevation[dest] ?? 0)) : 0;
        const slopeNorm = clamp(drop / maxDrop, 0, 1);
        const slope = Math.pow(slopeNorm, n);
        const streamPower = clamp(discharge * slope, 0, 1);

        const erosion = isLand ? erosionRate * (erodibility[i] ?? 0) * streamPower : 0;
        const baseSediment = Math.max(0, (scratchSediment[i] ?? 0) + erosion);

        const settles = baseSediment * depositionRate * (1 - streamPower);
        const transports =
          dest >= 0 && dest < size ? baseSediment * depositionRate * streamPower : 0;

        elevationDeltaEra[i] += diffusionDelta - erosion + settles;
        sedimentDeltaEra[i] += erosion - settles - transports;
        if (dest >= 0 && dest < size) {
          sedimentDeltaEra[dest] += transports;
        }
      }
    }

    for (let i = 0; i < size; i++) {
      const dE = elevationDeltaEra[i] ?? 0;
      const dS = sedimentDeltaEra[i] ?? 0;
      elevationDelta[i] += dE;
      sedimentDelta[i] += dS;
      scratchElevation[i] += dE;
      scratchSediment[i] = Math.max(0, scratchSediment[i] + dS);
    }
  }

  const nextElevation = new Int16Array(size);
  const nextLandMask = new Uint8Array(size);
  const bathymetry = new Int16Array(size);
  const nextSedimentDepth = new Float32Array(size);

  for (let i = 0; i < size; i++) {
    nextElevation[i] = clampInt16(Math.round((elevation[i] ?? 0) + (elevationDelta[i] ?? 0)));
    nextSedimentDepth[i] = Math.max(0, (sedimentDepth[i] ?? 0) + (sedimentDelta[i] ?? 0));
  }

  const waterElevation = clampInt16(Math.floor(seaLevel));
  const landElevation = clampInt16(Math.floor(seaLevel) + 1);
  for (let i = 0; i < size; i++) {
    const isLand = landMask[i] === 1;
    nextLandMask[i] = isLand ? 1 : 0;
    if (isLand) {
      if ((nextElevation[i] ?? 0) <= seaLevel) nextElevation[i] = landElevation;
      bathymetry[i] = 0;
      continue;
    }

    if ((nextElevation[i] ?? 0) > seaLevel) nextElevation[i] = waterElevation;
    bathymetry[i] = clampInt16(
      roundHalfAwayFromZero(Math.min(0, (nextElevation[i] ?? 0) - seaLevel))
    );
  }

  return {
    topography: {
      elevation: nextElevation,
      seaLevel,
      landMask: nextLandMask,
      bathymetry,
    },
    substrate: {
      erodibilityK: new Float32Array(erodibility),
      sedimentDepth: nextSedimentDepth,
    },
    deltas: { elevationDelta, sedimentDelta },
  };
}
