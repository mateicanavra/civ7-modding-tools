import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreVegetationRainforestContract from "./contract.js";
import { warmHumidStrategy } from "./strategies/index.js";

const scoreVegetationRainforest = createOp(ScoreVegetationRainforestContract, {
  strategies: {
    "warm-humid": warmHumidStrategy,
  },
});

export type * from "./contract.js";

export default scoreVegetationRainforest;
