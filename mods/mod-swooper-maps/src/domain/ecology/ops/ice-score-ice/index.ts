import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreIceContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const scoreIce = createOp(ScoreIceContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export type * from "./contract.js";

export default scoreIce;

