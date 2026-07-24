import { createStrategy } from "@swooper/mapgen-core/authoring";
import ComputeOceanSurfaceCurrentsContract from "../../contract.js";
import { computeCurrents } from "../../rules/index.js";
import LatitudeDefinition from "./config.js";

/** Latitude bands provide deterministic zonal currents when wind-and-gyre projection is not selected. */
const latitudeStrategy = createStrategy(ComputeOceanSurfaceCurrentsContract, LatitudeDefinition, {
  run: (input, config) => {
    const width = input.width;
    const height = input.height;

    const latitudeByRow = input.latitudeByRow;

    return computeCurrents(width, height, latitudeByRow, input.isWaterMask, config.strength);
  },
});

export default latitudeStrategy;
