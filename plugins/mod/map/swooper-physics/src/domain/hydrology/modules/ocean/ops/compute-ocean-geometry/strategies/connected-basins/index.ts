import { createStrategy } from "@swooper/mapgen-core/authoring";

import ComputeOceanGeometryContract from "../../contract.js";
import { computeOceanGeometry } from "../../rules/index.js";
import ConnectedBasinsDefinition from "./config.js";

/**
 * Derives connected basin identity, coast distance, normals, and tangents from the same water
 * topology traversal. Sharing the traversal prevents current projection from mixing incompatible
 * basin and coastline evidence.
 */
const connectedBasinsStrategy = createStrategy(
  ComputeOceanGeometryContract,
  ConnectedBasinsDefinition,
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

export default connectedBasinsStrategy;
