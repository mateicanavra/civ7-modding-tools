import { createOp } from "@swooper/mapgen-core/authoring";

import PlanWetPlacementOasisContract from "./contract.js";
import { defaultStrategy, disabledStrategy } from "./strategies/index.js";

const planWetPlacementOasis = createOp(PlanWetPlacementOasisContract, {
  strategies: {
    disabled: disabledStrategy,
    default: defaultStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default planWetPlacementOasis;

