import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeDrainageRoutingContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const computeDrainageRouting = createOp(ComputeDrainageRoutingContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default computeDrainageRouting;
