import { createOp } from "@swooper/mapgen-core/authoring";

import ComputePrecipitationContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Converts transported humidity and wind-terrain interaction into baseline rainfall evidence. */
export default createOp(ComputePrecipitationContract, { strategies });
