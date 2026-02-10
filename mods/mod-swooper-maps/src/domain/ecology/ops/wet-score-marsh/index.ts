import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreWetMarshContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const scoreWetMarsh = createOp(ScoreWetMarshContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export type * from "./contract.js";

export default scoreWetMarsh;

