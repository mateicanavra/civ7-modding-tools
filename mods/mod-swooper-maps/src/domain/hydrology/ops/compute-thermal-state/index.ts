import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeThermalStateContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Couples insolation, elevation, land, and ocean state into bounded surface temperature. */
export default createOp(ComputeThermalStateContract, { strategies });
