import { createOp } from "@swooper/mapgen-core/authoring";

import PlanFoothillsContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const planFoothills = createOp(PlanFoothillsContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default planFoothills;

