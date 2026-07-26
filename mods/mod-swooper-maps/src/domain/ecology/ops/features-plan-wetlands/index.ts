import { createOp } from "@swooper/mapgen-core/authoring";
import PlanWetlandsContract from "./contract.js";
import { habitatConfidenceStrategy } from "./strategies/index.js";

const planWetlands = createOp(PlanWetlandsContract, {
  strategies: {
    "habitat-confidence": habitatConfidenceStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default planWetlands;
