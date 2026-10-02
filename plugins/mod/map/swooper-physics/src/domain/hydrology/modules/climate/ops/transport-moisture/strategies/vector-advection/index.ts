import { createStrategy } from "@swooper/mapgen-core/authoring";

import TransportMoistureContract from "../../contract.js";
import { advectMoisture } from "../../rules/vector-advection.js";
import VectorAdvectionDefinition from "./config.js";

/** Binds admitted wind and evaporation fields to fixed-pass vector moisture transport. */
const vectorAdvectionStrategy = createStrategy(
  TransportMoistureContract,
  VectorAdvectionDefinition,
  {
    run: (input, config) => ({
      humidity: advectMoisture({
        width: input.width,
        height: input.height,
        windU: input.windU,
        windV: input.windV,
        evaporation: input.evaporation,
        iterations: config.iterations,
        advection: config.advection,
        retention: config.retention,
      }),
    }),
  }
);

export default vectorAdvectionStrategy;
