import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeEvaporationSourcesContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Converts exposed land and ocean thermal state into bounded moisture sources for atmospheric transport. */
export default createOp(ComputeEvaporationSourcesContract, { strategies });
