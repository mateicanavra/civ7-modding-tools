import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeClimateDiagnosticsContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Measures rain shadows, continentality, and wind convergence for downstream climate interpretation. */
export default createOp(ComputeClimateDiagnosticsContract, { strategies });
