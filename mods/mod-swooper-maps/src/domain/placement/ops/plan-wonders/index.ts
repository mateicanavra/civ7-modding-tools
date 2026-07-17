import { createOp } from "@swooper/mapgen-core/authoring";

import PlanWondersContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

/**
 * Derives the nonnegative natural-wonder target from Civ7 map-size metadata without selecting
 * candidates or claiming realized stamps.
 */
const planWonders = createOp(PlanWondersContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default planWonders;
