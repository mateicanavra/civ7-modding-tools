import { createOp } from "@swooper/mapgen-core/authoring";

import PlanNaturalWondersContract from "./contract.js";
import { suitabilityDiversityStrategy } from "./strategies/index.js";

/**
 * Deterministically selects natural-wonder intent and fallback anchors from catalog constraints
 * and map truth. It never stamps Civ7 features.
 */
const planNaturalWonders = createOp(PlanNaturalWondersContract, {
  strategies: {
    "suitability-diversity": suitabilityDiversityStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default planNaturalWonders;
