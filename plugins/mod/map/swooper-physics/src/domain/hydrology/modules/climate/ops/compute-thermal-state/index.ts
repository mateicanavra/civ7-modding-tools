import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeThermalStateContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Couples solar harmonics, model relief, and prescribed SST into periodic thermal response. */
export default createOp(ComputeThermalStateContract, { strategies });
