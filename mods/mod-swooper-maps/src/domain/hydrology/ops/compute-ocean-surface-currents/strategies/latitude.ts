import { createStrategy } from "@swooper/mapgen-core/authoring";
import ComputeOceanSurfaceCurrentsContract from "../contract.js";
import { computeCurrents } from "../rules/index.js";

export const latitudeStrategy = createStrategy(ComputeOceanSurfaceCurrentsContract, "latitude", {
  run: (input, config) => {
    const width = input.width;
    const height = input.height;

    const latitudeByRow = input.latitudeByRow;

    return computeCurrents(width, height, latitudeByRow, input.isWaterMask, config.strength);
  },
});
