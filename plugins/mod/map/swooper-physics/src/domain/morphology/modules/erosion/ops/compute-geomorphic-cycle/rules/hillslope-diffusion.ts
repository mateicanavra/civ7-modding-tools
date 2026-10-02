import { forEachHexNeighborOddQ } from "@swooper/mapgen-core/lib/grid";
import { publishGeomorphicTopography } from "./publication.js";
import { resolveWorldAgeScale } from "./world-age.js";

type HillslopeConfig = Readonly<{
  worldAge: "young" | "mature" | "old";
  geomorphology: Readonly<{
    diffusion: Readonly<{ rate: number }>;
    eras: number;
  }>;
}>;

type HillslopeParams = Readonly<{
  width: number;
  height: number;
  elevation: ArrayLike<number>;
  seaLevel: number;
  landMask: ArrayLike<number>;
  erodibility: ArrayLike<number>;
  sedimentDepth: ArrayLike<number>;
  config: HillslopeConfig;
}>;

/** Diffuses initial hillslopes only; routing and sediment transport are not part of this law. */
export function evolveHillslopeSurface(params: HillslopeParams) {
  const { width, height, elevation, seaLevel, landMask, erodibility, sedimentDepth, config } = params;
  const size = width * height;
  if (!Number.isSafeInteger(width) || width < 1 || !Number.isSafeInteger(height) || height < 1 ||
      !Number.isSafeInteger(size)) {
    throw new Error("Hillslope diffusion requires positive integer map dimensions.");
  }
  for (const [name, field] of Object.entries({ elevation, landMask, erodibility, sedimentDepth })) {
    if (field.length !== size) throw new Error(`Hillslope diffusion ${name} must match map dimensions.`);
  }
  const ageScale = resolveWorldAgeScale(config.worldAge);
  const rate = config.geomorphology.diffusion.rate;
  const eras = config.geomorphology.eras;
  if (!Number.isFinite(seaLevel) || !Number.isFinite(ageScale) || !Number.isFinite(rate) ||
      rate < 0 || rate > 1 || !Number.isInteger(eras) || eras < 1 || eras > 3) {
    throw new Error("Hillslope diffusion requires finite admitted sea, world age, rate, and era controls.");
  }
  for (let i = 0; i < size; i++) {
    if (!Number.isInteger(elevation[i]) || elevation[i] < -32768 || elevation[i] > 32767 ||
        (landMask[i] !== 0 && landMask[i] !== 1) ||
        !Number.isFinite(erodibility[i]) || erodibility[i] < 0 ||
        !Number.isFinite(sedimentDepth[i]) || sedimentDepth[i] < 0) {
      throw new Error(`Hillslope diffusion requires valid ground, identity, and substrate at tile ${i}.`);
    }
  }

  const scratchElevation = new Float32Array(elevation);
  const elevationDelta = new Float32Array(size);
  const diffusionRate = rate * ageScale;
  for (let era = 0; era < eras; era++) {
    const eraDelta = new Float32Array(size);
    if (diffusionRate > 0) {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = y * width + x;
          if (landMask[i] !== 1) continue;
          const current = scratchElevation[i];
          let neighborSum = current;
          let neighborCount = 1;
          forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
            neighborSum += scratchElevation[ny * width + nx];
            neighborCount++;
          });
          eraDelta[i] = (neighborSum / neighborCount - current) * diffusionRate;
        }
      }
    }
    for (let i = 0; i < size; i++) {
      elevationDelta[i] += eraDelta[i];
      scratchElevation[i] += eraDelta[i];
    }
  }

  return {
    topography: publishGeomorphicTopography({ elevation, elevationDelta, landMask, seaLevel }),
    substrate: {
      erodibilityK: new Float32Array(erodibility),
      sedimentDepth: new Float32Array(sedimentDepth),
    },
    deltas: { elevationDelta },
  };
}
