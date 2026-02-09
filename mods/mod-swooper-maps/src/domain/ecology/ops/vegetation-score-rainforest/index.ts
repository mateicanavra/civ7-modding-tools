import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreVegetationRainforestContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const scoreVegetationRainforest = createOp(ScoreVegetationRainforestContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export type * from "./contract.js";

export default scoreVegetationRainforest;

