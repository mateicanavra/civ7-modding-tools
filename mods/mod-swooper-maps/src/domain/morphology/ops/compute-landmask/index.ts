import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeLandmaskContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Resolves connected land from crust, provenance, and tectonic continent potential. */
const computeLandmask = createOp(ComputeLandmaskContract, { strategies });

export default computeLandmask;
