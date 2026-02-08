import { createOp } from "@swooper/mapgen-core/authoring";

import PlanVegetationSavannaWoodlandContract from "./contract.js";
import { clusteredStrategy, defaultStrategy } from "./strategies/index.js";

const planVegetationSavannaWoodland = createOp(PlanVegetationSavannaWoodlandContract, {
  strategies: {
    default: defaultStrategy,
    clustered: clusteredStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default planVegetationSavannaWoodland;

