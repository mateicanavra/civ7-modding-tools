import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeShelfMaskContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Identifies shore-connected shelf water from the sculpted continental-break gradient. */
const computeShelfMask = createOp(ComputeShelfMaskContract, { strategies });

export default computeShelfMask;
