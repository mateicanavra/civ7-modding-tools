import { createOp } from "@swooper/mapgen-core/authoring";

import PlanWetPlacementMangroveContract from "./contract.js";
import { defaultStrategy, disabledStrategy } from "./strategies/index.js";

const planWetPlacementMangrove = createOp(PlanWetPlacementMangroveContract, {
  strategies: {
    disabled: disabledStrategy,
    default: defaultStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default planWetPlacementMangrove;

