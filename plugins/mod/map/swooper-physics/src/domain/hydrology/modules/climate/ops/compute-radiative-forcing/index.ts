import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeRadiativeForcingContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Converts latitude and seasonal phase into a bounded per-tile insolation field. */
export default createOp(ComputeRadiativeForcingContract, { strategies });
