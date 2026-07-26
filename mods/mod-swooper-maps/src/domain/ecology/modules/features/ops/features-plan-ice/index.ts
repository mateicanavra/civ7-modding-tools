import { createOp } from "@swooper/mapgen-core/authoring";

import PlanIceContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Converts freeze suitability into sparse ice intent without claiming reserved or occupied tiles. */
export default createOp(PlanIceContract, { strategies });
