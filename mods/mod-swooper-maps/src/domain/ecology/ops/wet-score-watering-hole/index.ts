import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreWetWateringHoleContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const scoreWetWateringHole = createOp(ScoreWetWateringHoleContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export type * from "./contract.js";

export default scoreWetWateringHole;

