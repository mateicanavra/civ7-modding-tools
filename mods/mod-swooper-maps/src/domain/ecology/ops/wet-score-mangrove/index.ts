import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreWetMangroveContract from "./contract.js";
import { warmIntertidalStrategy } from "./strategies/index.js";

const scoreWetMangrove = createOp(ScoreWetMangroveContract, {
  strategies: {
    "warm-intertidal": warmIntertidalStrategy,
  },
});

export type * from "./contract.js";

export default scoreWetMangrove;
