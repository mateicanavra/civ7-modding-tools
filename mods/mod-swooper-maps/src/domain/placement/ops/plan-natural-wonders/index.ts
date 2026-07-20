import { createOp } from "@swooper/mapgen-core/authoring";

import PlanNaturalWondersContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

/**
 * Deterministically selects natural-wonder intent and fallback anchors from catalog constraints
 * and map truth. It never stamps Civ7 features.
 */
const planNaturalWonders = createOp(PlanNaturalWondersContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default planNaturalWonders;
