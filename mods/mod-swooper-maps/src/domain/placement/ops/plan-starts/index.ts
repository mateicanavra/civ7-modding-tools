import { createOp } from "@swooper/mapgen-core/authoring";

import PlanStartsContract from "./contract.js";
import { viabilityFairnessStrategy } from "./strategies/index.js";

/**
 * Selects first-age seat intent through the closed fallback ladder and records every relaxation.
 * Recipe materialization consumes the result without choosing starts locally.
 */
const planStarts = createOp(PlanStartsContract, {
  strategies: {
    "viability-fairness": viabilityFairnessStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default planStarts;
