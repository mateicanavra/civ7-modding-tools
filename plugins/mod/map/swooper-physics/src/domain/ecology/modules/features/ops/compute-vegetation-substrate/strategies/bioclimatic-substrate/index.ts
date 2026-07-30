import { createStrategy } from "@swooper/mapgen-core/authoring";

import Contract from "../../contract.js";
import { computeVegetationSubstrateFields } from "../../rules/index.js";
import StrategyDefinition from "./config.js";

/** Projects bioclimatic evidence onto stable zero-to-one planning fields without selecting features. */
const bioclimaticSubstrateStrategy = createStrategy(Contract, StrategyDefinition, {
  run: (input, config) => {
    return computeVegetationSubstrateFields({
      size: input.width * input.height,
      landMask: input.landMask,
      effectiveMoisture: input.effectiveMoisture,
      surfaceTemperature: input.surfaceTemperature,
      aridityIndex: input.aridityIndex,
      freezeIndex: input.freezeIndex,
      vegetationDensity: input.vegetationDensity,
      fertility: input.fertility,
      moistureNormalization: config.moistureNormalization,
      temperatureMinC: config.temperatureMinC,
      temperatureMaxC: config.temperatureMaxC,
    });
  },
});

export default bioclimaticSubstrateStrategy;
