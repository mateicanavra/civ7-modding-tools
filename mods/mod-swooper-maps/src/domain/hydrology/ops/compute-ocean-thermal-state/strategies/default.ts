import { createStrategy } from "@swooper/mapgen-core/authoring";

import ComputeOceanThermalStateContract from "../contract.js";
import { computeOceanThermalState } from "../rules/index.js";

export const defaultStrategy = createStrategy(ComputeOceanThermalStateContract, "default", {
  run: (input, config) => {
    const width = input.width;
    const height = input.height;

    return computeOceanThermalState(
      width,
      height,
      input.latitudeByRow,
      input.isWaterMask,
      input.shelfMask,
      input.currentU,
      input.currentV,
      {
        equatorTempC: config.equatorTempC,
        poleTempC: config.poleTempC,
        advectIters: config.advectIters,
        diffusion: config.diffusion,
        secondaryWeightMin: config.secondaryWeightMin,
        seaIceThresholdC: config.seaIceThresholdC,
      }
    );
  },
});
