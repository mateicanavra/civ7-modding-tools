import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreReefContract from "./contract.js";
import { warmCoastalShelfStrategy } from "./strategies/index.js";

const scoreReef = createOp(ScoreReefContract, {
  strategies: {
    "warm-coastal-shelf": warmCoastalShelfStrategy,
  },
});

export type * from "./contract.js";

export default scoreReef;
