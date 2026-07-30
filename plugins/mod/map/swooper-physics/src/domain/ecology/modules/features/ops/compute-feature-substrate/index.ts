import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeFeatureSubstrateContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Derives shared river, coastal, lowland, and hydromorphic masks so feature planners consume one physical substrate authority. */
export default createOp(ComputeFeatureSubstrateContract, { strategies });
