import { createStrategy } from "@swooper/mapgen-core/authoring";

import ComputeOceanGeometryContract from "../contract.js";
import { computeOceanGeometry } from "../rules/index.js";

export const connectedBasinsStrategy = createStrategy(
  ComputeOceanGeometryContract,
  "connected-basins",
  {
    run: (input, config) => {
      const width = input.width;
      const height = input.height;

      return computeOceanGeometry(width, height, input.isWaterMask, input.coastalWaterMask, {
        maxCoastDistance: config.maxCoastDistance,
        maxCoastVectorDistance: config.maxCoastVectorDistance,
      });
    },
  }
);
