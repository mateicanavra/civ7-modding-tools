import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreColdReefContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const scoreColdReef = createOp(ScoreColdReefContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export type * from "./contract.js";

export default scoreColdReef;

