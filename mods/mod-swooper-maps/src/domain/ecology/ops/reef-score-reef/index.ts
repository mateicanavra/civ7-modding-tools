import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreReefContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const scoreReef = createOp(ScoreReefContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export type * from "./contract.js";

export default scoreReef;

