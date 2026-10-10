import { clamp01 } from "@swooper/mapgen-core";

/**
 * Computes normalized energy, water, stress, biomass, and fertility fields.
 */
export function computeVegetationSubstrateFields(args: {
  readonly size: number;
  readonly landMask: ArrayLike<number>;
  readonly effectiveMoisture: ArrayLike<number>;
  readonly surfaceTemperature: ArrayLike<number>;
  readonly aridityIndex: ArrayLike<number>;
  readonly plantEffectiveMoisture: ArrayLike<number>;
  readonly plantWaterStress: ArrayLike<number>;
  readonly freezeIndex: ArrayLike<number>;
  readonly vegetationDensity: ArrayLike<number>;
  readonly fertility: ArrayLike<number>;
  readonly moistureNormalization: number;
  readonly temperatureMinC: number;
  readonly temperatureMaxC: number;
}): Readonly<{
  energy01: Float32Array;
  atmosphericWater01: Float32Array;
  climaticAridity01: Float32Array;
  plantWater01: Float32Array;
  plantWaterStress01: Float32Array;
  coldStress01: Float32Array;
  biomass01: Float32Array;
  fertility01: Float32Array;
}> {
  const moistureNormalization = Math.max(1e-6, args.moistureNormalization);
  const tempMin = Math.min(args.temperatureMinC, args.temperatureMaxC);
  const tempMax = Math.max(args.temperatureMinC, args.temperatureMaxC);
  const tempRange = Math.max(1e-6, tempMax - tempMin);

  const energy01 = new Float32Array(args.size);
  const atmosphericWater01 = new Float32Array(args.size);
  const climaticAridity01 = new Float32Array(args.size);
  const plantWater01 = new Float32Array(args.size);
  const plantWaterStress01 = new Float32Array(args.size);
  const coldStress01 = new Float32Array(args.size);
  const biomass01 = new Float32Array(args.size);
  const fertility01 = new Float32Array(args.size);

  for (let i = 0; i < args.size; i++) {
    if (args.landMask[i] === 0) {
      energy01[i] = 0;
      coldStress01[i] = 0;
      biomass01[i] = 0;
      fertility01[i] = 0;
      continue;
    }

    const temp = args.surfaceTemperature[i];
    energy01[i] = clamp01((temp - tempMin) / tempRange);

    const moisture = args.effectiveMoisture[i];
    atmosphericWater01[i] = clamp01(moisture / moistureNormalization);
    plantWater01[i] = clamp01(args.plantEffectiveMoisture[i] / moistureNormalization);

    // Indices from biome classification are already normalized to 0..1.
    climaticAridity01[i] = clamp01(args.aridityIndex[i]);
    plantWaterStress01[i] = clamp01(args.plantWaterStress[i]);
    coldStress01[i] = clamp01(args.freezeIndex[i]);

    biomass01[i] = clamp01(args.vegetationDensity[i]);
    fertility01[i] = clamp01(args.fertility[i]);
  }

  return { energy01, atmosphericWater01, climaticAridity01, plantWater01, plantWaterStress01, coldStress01, biomass01, fertility01 };
}
