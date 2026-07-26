import { createStrategy } from "@swooper/mapgen-core/authoring";
import ComputeOceanSurfaceCurrentsContract from "../../contract.js";
import { computeCurrents } from "../../rules/index.js";
import LatitudeDefinition from "./config.js";

/**
 * Projects deterministic zonal currents from latitude over water tiles only. It deliberately
 * ignores wind, basin, and coastline evidence, making it the stable fallback to wind-gyre
 * projection.
 */
const latitudeStrategy = createStrategy(ComputeOceanSurfaceCurrentsContract, LatitudeDefinition, {
  run: (input, config) => {
    const width = input.width;
    const height = input.height;

    const latitudeByRow = input.latitudeByRow;

    return computeCurrents(width, height, latitudeByRow, input.isWaterMask, config.strength);
  },
});

export default latitudeStrategy;
