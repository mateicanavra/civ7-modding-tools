import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeDistanceToCoastContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Measures wrapped-hex distance from every tile to the nearest admitted coastal seed. */
const computeDistanceToCoast = createOp(ComputeDistanceToCoastContract, { strategies });

export default computeDistanceToCoast;
