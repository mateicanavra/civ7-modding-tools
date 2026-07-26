import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeAtmosphericCirculationContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Builds deterministic prevailing winds from latitude, pressure structure, land heating, and terrain. */
export default createOp(ComputeAtmosphericCirculationContract, { strategies });
