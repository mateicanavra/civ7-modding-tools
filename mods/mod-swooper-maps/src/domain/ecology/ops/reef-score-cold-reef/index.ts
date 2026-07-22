import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreColdReefContract from "./contract.js";
import { coldShelfStrategy } from "./strategies/index.js";

const scoreColdReef = createOp(ScoreColdReefContract, {
  strategies: {
    "cold-shelf": coldShelfStrategy,
  },
});

export type * from "./contract.js";

export default scoreColdReef;
