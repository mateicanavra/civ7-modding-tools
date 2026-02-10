import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreAtollContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const scoreAtoll = createOp(ScoreAtollContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export type * from "./contract.js";

export default scoreAtoll;

