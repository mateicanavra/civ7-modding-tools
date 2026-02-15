import { createOp } from "@swooper/mapgen-core/authoring";

import PlanNaturalWondersContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const planNaturalWonders = createOp(PlanNaturalWondersContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default planNaturalWonders;
