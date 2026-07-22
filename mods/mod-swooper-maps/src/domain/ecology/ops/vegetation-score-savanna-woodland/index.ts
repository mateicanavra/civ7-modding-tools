import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreVegetationSavannaWoodlandContract from "./contract.js";
import { warmSeasonalStrategy } from "./strategies/index.js";

const scoreVegetationSavannaWoodland = createOp(ScoreVegetationSavannaWoodlandContract, {
  strategies: {
    "warm-seasonal": warmSeasonalStrategy,
  },
});

export type * from "./contract.js";

export default scoreVegetationSavannaWoodland;
