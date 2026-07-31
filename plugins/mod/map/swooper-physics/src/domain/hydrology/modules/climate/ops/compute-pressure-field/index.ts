import { createOp } from "@swooper/mapgen-core/authoring";

import ComputePressureFieldContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Builds a deterministic circulation-oriented mean-sea-level pressure-anomaly proxy. */
export default createOp(ComputePressureFieldContract, { strategies });
