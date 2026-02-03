import { createStrategy } from "@swooper/mapgen-core/authoring";

import ComputeOceanGeometryContract from "../contract.js";
import { computeOceanGeometry } from "../rules/index.js";

export const defaultStrategy = createStrategy(ComputeOceanGeometryContract, "default", {
  run: (input, config) => {
    const width = input.width | 0;
    const height = input.height | 0;
    const size = Math.max(0, width * height);

    if (!(input.isWaterMask instanceof Uint8Array) || input.isWaterMask.length !== size) {
      throw new Error("[Hydrology] Invalid isWaterMask for hydrology/compute-ocean-geometry.");
    }
    if (!(input.coastalWaterMask instanceof Uint8Array) || input.coastalWaterMask.length !== size) {
      throw new Error("[Hydrology] Invalid coastalWaterMask for hydrology/compute-ocean-geometry.");
    }
    if (!(input.distanceToCoast instanceof Uint16Array) || input.distanceToCoast.length !== size) {
      throw new Error("[Hydrology] Invalid distanceToCoast for hydrology/compute-ocean-geometry.");
    }
    if (!(input.shelfMask instanceof Uint8Array) || input.shelfMask.length !== size) {
      throw new Error("[Hydrology] Invalid shelfMask for hydrology/compute-ocean-geometry.");
    }

    return computeOceanGeometry(width, height, input.isWaterMask, input.coastalWaterMask, {
      maxCoastDistance: config.maxCoastDistance,
      maxCoastVectorDistance: config.maxCoastVectorDistance,
    });
  },
});
