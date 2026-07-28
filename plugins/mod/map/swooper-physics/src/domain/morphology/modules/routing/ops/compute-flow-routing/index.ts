import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeFlowRoutingContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Routes geomorphic flow downslope and accumulates the resulting terrain-drainage proxy. */
const computeFlowRouting = createOp(ComputeFlowRoutingContract, { strategies });

export default computeFlowRouting;
