import { createStrategy } from "@swooper/mapgen-core/authoring";

import ScoreVegetationSagebrushSteppeContract from "../contract.js";
import { scoreSagebrushSteppeSuitability } from "../rules/index.js";

export const defaultStrategy = createStrategy(ScoreVegetationSagebrushSteppeContract, "default", {
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
