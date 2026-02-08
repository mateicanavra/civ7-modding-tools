import { createOp } from "@swooper/mapgen-core/authoring";

import PlanVegetatedPlacementSavannaWoodlandContract from "./contract.js";
import { defaultStrategy, disabledStrategy } from "./strategies/index.js";

const planVegetatedPlacementSavannaWoodland = createOp(PlanVegetatedPlacementSavannaWoodlandContract, {
  strategies: {
    disabled: disabledStrategy,
    default: defaultStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default planVegetatedPlacementSavannaWoodland;

