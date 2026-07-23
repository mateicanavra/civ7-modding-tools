import { createStrategy } from "@swooper/mapgen-core/authoring";

import ComputeOceanGeometryContract from "../../contract.js";
import { computeOceanGeometry } from "../../rules/index.js";
import ConnectedBasinsContract from "./contract.js";

/** Connected-component and coast-distance traversal derive basin identity, normals, and tangents from one topology. */
const connectedBasinsStrategy = createStrategy(
  ComputeOceanGeometryContract,
  ConnectedBasinsContract,
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
