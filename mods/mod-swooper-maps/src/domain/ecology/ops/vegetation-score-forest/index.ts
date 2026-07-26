import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreVegetationForestContract from "./contract.js";
import { temperateHumidStrategy } from "./strategies/index.js";

const scoreVegetationForest = createOp(ScoreVegetationForestContract, {
  strategies: {
    "temperate-humid": temperateHumidStrategy,
  },
});

export type * from "./contract.js";

export default scoreVegetationForest;
