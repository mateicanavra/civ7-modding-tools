import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeFlowRoutingContract from "./contract.js";
import { steepestDescentStrategy } from "./strategies/index.js";

const computeFlowRouting = createOp(ComputeFlowRoutingContract, {
  strategies: {
    "steepest-descent": steepestDescentStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default computeFlowRouting;
