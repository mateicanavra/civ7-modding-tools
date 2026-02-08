import { createOp } from "@swooper/mapgen-core/authoring";

import PlanVegetatedFeaturePlacementsContract from "./contract.js";
import { defaultStrategy, disabledStrategy } from "./strategies/index.js";

const planVegetatedFeaturePlacements = createOp(PlanVegetatedFeaturePlacementsContract, {
  strategies: {
    disabled: disabledStrategy,
    default: defaultStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default planVegetatedFeaturePlacements;
