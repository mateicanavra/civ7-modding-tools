import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeAtmosphericCirculationContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Builds deterministic prevailing winds from analytic latitude cells and bounded pressure flow. */
export default createOp(ComputeAtmosphericCirculationContract, { strategies });
