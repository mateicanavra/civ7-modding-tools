import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeDrainageRoutingContract from "./contract.js";
import { priorityFloodStrategy } from "./strategies/index.js";

const computeDrainageRouting = createOp(ComputeDrainageRoutingContract, {
  strategies: {
    "priority-flood": priorityFloodStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default computeDrainageRouting;
