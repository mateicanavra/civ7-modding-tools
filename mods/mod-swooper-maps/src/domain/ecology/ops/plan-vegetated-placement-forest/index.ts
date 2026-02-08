import { createOp } from "@swooper/mapgen-core/authoring";

import PlanVegetatedPlacementForestContract from "./contract.js";
import { defaultStrategy, disabledStrategy } from "./strategies/index.js";

const planVegetatedPlacementForest = createOp(PlanVegetatedPlacementForestContract, {
  strategies: {
    disabled: disabledStrategy,
    default: defaultStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default planVegetatedPlacementForest;

