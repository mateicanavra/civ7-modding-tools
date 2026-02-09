import { createStrategy } from "@swooper/mapgen-core/authoring";

import ComputeVegetationSubstrateContract from "../contract.js";
import { computeVegetationSubstrateFields, validateVegetationSubstrateInputs } from "../rules/index.js";

export const defaultStrategy = createStrategy(ComputeVegetationSubstrateContract, "default", {
  run: (input, config) => {
    const size = validateVegetationSubstrateInputs({
      width: input.width,
      height: input.height,
      landMask: input.landMask as Uint8Array,
      effectiveMoisture: input.effectiveMoisture as Float32Array,
      surfaceTemperature: input.surfaceTemperature as Float32Array,
      aridityIndex: input.aridityIndex as Float32Array,
      freezeIndex: input.freezeIndex as Float32Array,
      vegetationDensity: input.vegetationDensity as Float32Array,
      fertility: input.fertility as Float32Array,
    });

    return computeVegetationSubstrateFields({
      size,
      landMask: input.landMask as Uint8Array,
      effectiveMoisture: input.effectiveMoisture as Float32Array,
      surfaceTemperature: input.surfaceTemperature as Float32Array,
      aridityIndex: input.aridityIndex as Float32Array,
      freezeIndex: input.freezeIndex as Float32Array,
      vegetationDensity: input.vegetationDensity as Float32Array,
      fertility: input.fertility as Float32Array,
      moistureNormalization: config.moistureNormalization,
      temperatureMinC: config.temperatureMinC,
      temperatureMaxC: config.temperatureMaxC,
    });
  },
});

