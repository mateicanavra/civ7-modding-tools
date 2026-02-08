import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreVegetationSavannaWoodlandContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const scoreVegetationSavannaWoodland = createOp(ScoreVegetationSavannaWoodlandContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export type * from "./contract.js";

export default scoreVegetationSavannaWoodland;

