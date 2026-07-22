import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreWetWateringHoleContract from "./contract.js";
import { aridWaterpointStrategy } from "./strategies/index.js";

const scoreWetWateringHole = createOp(ScoreWetWateringHoleContract, {
  strategies: {
    "arid-waterpoint": aridWaterpointStrategy,
  },
});

export type * from "./contract.js";

export default scoreWetWateringHole;
