import { createOp } from "@swooper/mapgen-core/authoring";

import PlanVegetationForestContract from "./contract.js";
import { clusteredStrategy, defaultStrategy } from "./strategies/index.js";

const planVegetationForest = createOp(PlanVegetationForestContract, {
  strategies: {
    default: defaultStrategy,
    clustered: clusteredStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default planVegetationForest;

