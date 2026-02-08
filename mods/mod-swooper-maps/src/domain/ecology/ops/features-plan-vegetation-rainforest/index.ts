import { createOp } from "@swooper/mapgen-core/authoring";

import PlanVegetationRainforestContract from "./contract.js";
import { clusteredStrategy, defaultStrategy } from "./strategies/index.js";

const planVegetationRainforest = createOp(PlanVegetationRainforestContract, {
  strategies: {
    default: defaultStrategy,
    clustered: clusteredStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default planVegetationRainforest;

