import { clamp01 } from "@swooper/mapgen-core";

export function computeVegetationSubstrateFields(args: {
  size: number;
  landMask: Uint8Array;
  effectiveMoisture: Float32Array;
  surfaceTemperature: Float32Array;
  aridityIndex: Float32Array;
  freezeIndex: Float32Array;
  vegetationDensity: Float32Array;
  fertility: Float32Array;
  moistureNormalization: number;
  temperatureMinC: number;
  temperatureMaxC: number;
}): Readonly<{
  energy01: Float32Array;
  water01: Float32Array;
  waterStress01: Float32Array;
  coldStress01: Float32Array;
  biomass01: Float32Array;
  fertility01: Float32Array;
}> {
  const moistureNormalization = Math.max(1e-6, args.moistureNormalization);
  const tempMin = Math.min(args.temperatureMinC, args.temperatureMaxC);
  const tempMax = Math.max(args.temperatureMinC, args.temperatureMaxC);
  const tempRange = Math.max(1e-6, tempMax - tempMin);

  const energy01 = new Float32Array(args.size);
  const water01 = new Float32Array(args.size);
  const waterStress01 = new Float32Array(args.size);
  const coldStress01 = new Float32Array(args.size);
  const biomass01 = new Float32Array(args.size);
  const fertility01 = new Float32Array(args.size);

  for (let i = 0; i < args.size; i++) {
    if (args.landMask[i] === 0) {
      energy01[i] = 0;
      water01[i] = 0;
      waterStress01[i] = 0;
      coldStress01[i] = 0;
      biomass01[i] = 0;
      fertility01[i] = 0;
      continue;
    }

    const temp = args.surfaceTemperature[i];
    energy01[i] = clamp01((temp - tempMin) / tempRange);

    const moisture = args.effectiveMoisture[i];
    water01[i] = clamp01(moisture / moistureNormalization);

    // Indices from biome classification are already normalized to 0..1.
    waterStress01[i] = clamp01(args.aridityIndex[i]);
    coldStress01[i] = clamp01(args.freezeIndex[i]);

    biomass01[i] = clamp01(args.vegetationDensity[i]);
    fertility01[i] = clamp01(args.fertility[i]);
  }

  return { energy01, water01, waterStress01, coldStress01, biomass01, fertility01 };
}

