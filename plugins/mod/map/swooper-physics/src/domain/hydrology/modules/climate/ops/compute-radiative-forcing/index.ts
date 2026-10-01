import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeRadiativeForcingContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Converts true latitude and axial tilt into daily-mean solar harmonics. */
export default createOp(ComputeRadiativeForcingContract, { strategies });
