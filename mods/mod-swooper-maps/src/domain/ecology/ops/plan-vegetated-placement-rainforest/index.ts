import { createOp } from "@swooper/mapgen-core/authoring";

import PlanVegetatedPlacementRainforestContract from "./contract.js";
import { defaultStrategy, disabledStrategy } from "./strategies/index.js";

const planVegetatedPlacementRainforest = createOp(PlanVegetatedPlacementRainforestContract, {
  strategies: {
    disabled: disabledStrategy,
    default: defaultStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default planVegetatedPlacementRainforest;

