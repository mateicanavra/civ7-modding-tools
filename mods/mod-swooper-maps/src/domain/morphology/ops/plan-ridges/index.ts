import { createOp } from "@swooper/mapgen-core/authoring";

import PlanRidgesContract from "./contract.js";
import { orogenicRangeGrowthStrategy } from "./strategies/index.js";

const planRidges = createOp(PlanRidgesContract, {
  strategies: {
    "orogenic-range-growth": orogenicRangeGrowthStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default planRidges;
