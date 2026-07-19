import { createStrategy } from "@swooper/mapgen-core/authoring";

import ComputeOceanSurfaceCurrentsContract from "../contract.js";
import { computeCurrentsEarthlike } from "../rules/index.js";

export const defaultStrategy = createStrategy(ComputeOceanSurfaceCurrentsContract, "default", {
  run: (input, config) => {
    const width = input.width;
    const height = input.height;

    return computeCurrentsEarthlike(
      width,
      height,
      input.latitudeByRow,
      input.isWaterMask,
      input.windU,
      input.windV,
      {
        basinId: input.basinId,
        coastDistance: input.coastDistance,
        coastTangentU: input.coastTangentU,
        coastTangentV: input.coastTangentV,
        maxSpeed: config.maxSpeed,
        windStrength: config.windStrength,
        ekmanStrength: config.ekmanStrength,
        gyreStrength: config.gyreStrength,
        coastStrength: config.coastStrength,
        smoothIters: config.smoothIters,
        projectionIters: config.projectionIters,
      }
    );
  },
});
