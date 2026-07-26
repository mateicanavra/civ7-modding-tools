import { createStrategy } from "@swooper/mapgen-core/authoring";

import ComputeOceanSurfaceCurrentsContract from "../../contract.js";
import { computeCurrentsEarthlike } from "../../rules/index.js";
import WindGyreProjectionDefinition from "./config.js";

/**
 * Combines wind imprint, hemisphere-aware Ekman drift, optional basin gyres, and coast-aligned flow,
 * then smooths and reduces divergence on water. Fixed solver passes and `maxSpeed` quantization keep
 * the current field deterministic and bounded.
 */
const windGyreProjectionStrategy = createStrategy(
  ComputeOceanSurfaceCurrentsContract,
  WindGyreProjectionDefinition,
  {
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
  }
);

export default windGyreProjectionStrategy;
