import { createOp } from "@swooper/mapgen-core/authoring";

import PlanRidgesContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const planRidges = createOp(PlanRidgesContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default planRidges;

