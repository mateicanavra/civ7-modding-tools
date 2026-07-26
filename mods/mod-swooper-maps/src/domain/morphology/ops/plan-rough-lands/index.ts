import { createOp } from "@swooper/mapgen-core/authoring";

import PlanRoughLandsContract from "./contract.js";
import { reliefSubstrateClustersStrategy } from "./strategies/index.js";

const planRoughLands = createOp(PlanRoughLandsContract, {
  strategies: {
    "relief-substrate-clusters": reliefSubstrateClustersStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default planRoughLands;
