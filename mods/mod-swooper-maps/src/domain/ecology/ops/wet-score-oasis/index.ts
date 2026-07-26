import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreWetOasisContract from "./contract.js";
import { warmAridWaterpointStrategy } from "./strategies/index.js";

const scoreWetOasis = createOp(ScoreWetOasisContract, {
  strategies: {
    "warm-arid-waterpoint": warmAridWaterpointStrategy,
  },
});

export type * from "./contract.js";

export default scoreWetOasis;
