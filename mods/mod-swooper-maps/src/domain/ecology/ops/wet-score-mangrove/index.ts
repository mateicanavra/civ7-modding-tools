import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreWetMangroveContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const scoreWetMangrove = createOp(ScoreWetMangroveContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export type * from "./contract.js";

export default scoreWetMangrove;

