import { createStrategy } from "@swooper/mapgen-core/authoring";

import Contract from "../../contract.js";
import { scoreSagebrushSteppeSuitability } from "../../rules/index.js";
import StrategyContract from "./contract.js";

/** Projects warm semiarid conditions and sparse biomass into bounded sagebrush-steppe suitability. */
const semiaridOpenStrategy = createStrategy(Contract, StrategyContract, {
  run: (input) => {
    const score01 = scoreSagebrushSteppeSuitability({
      size: input.width * input.height,
      landMask: input.landMask as Uint8Array,
      energy01: input.energy01 as Float32Array,
      water01: input.water01 as Float32Array,
      waterStress01: input.waterStress01 as Float32Array,
      biomass01: input.biomass01 as Float32Array,
    });

    return { score01 };
  },
});

export default semiaridOpenStrategy;
