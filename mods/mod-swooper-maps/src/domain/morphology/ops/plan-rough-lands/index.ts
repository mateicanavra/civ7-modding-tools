import { createOp } from "@swooper/mapgen-core/authoring";

import PlanRoughLandsContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const planRoughLands = createOp(PlanRoughLandsContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default planRoughLands;
