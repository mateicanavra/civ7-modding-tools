import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreWetOasisContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const scoreWetOasis = createOp(ScoreWetOasisContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export type * from "./contract.js";

export default scoreWetOasis;

