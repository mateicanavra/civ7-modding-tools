import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreVegetationForestContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const scoreVegetationForest = createOp(ScoreVegetationForestContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export type * from "./contract.js";

export default scoreVegetationForest;

