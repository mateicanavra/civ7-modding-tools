import { createOp } from "@swooper/mapgen-core/authoring";
import ComputeCryosphereStateContract from "./contract.js";
import { temperatureThresholdsStrategy } from "./strategies/index.js";

const computeCryosphereState = createOp(ComputeCryosphereStateContract, {
  strategies: { "temperature-thresholds": temperatureThresholdsStrategy },
});

export type * from "./contract.js";
export type * from "./types.js";

export default computeCryosphereState;
