import { createStrategy } from "@swooper/mapgen-core/authoring";

import Contract from "../../contract.js";
import { computeVegetationSubstrateFields } from "../../rules/index.js";
import StrategyDefinition from "./config.js";

/** Projects bioclimatic evidence onto stable zero-to-one planning fields without selecting features. */
const bioclimaticSubstrateStrategy = createStrategy(Contract, StrategyDefinition, {
  run: (input, config) => {
    return computeVegetationSubstrateFields({
      size: input.width * input.height,
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

export default bioclimaticSubstrateStrategy;
