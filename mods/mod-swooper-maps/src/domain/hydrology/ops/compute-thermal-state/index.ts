import { createOp } from "@swooper/mapgen-core/authoring";
import ComputeThermalStateContract from "./contract.js";
import { insolationLapseRateStrategy } from "./strategies/index.js";

const computeThermalState = createOp(ComputeThermalStateContract, {
  strategies: { "insolation-lapse-rate": insolationLapseRateStrategy },
});

export type * from "./contract.js";
export type * from "./types.js";

export default computeThermalState;
