import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeClimateDiagnosticsContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Computes optional explanatory indices without publishing a second climate truth surface. */
export default createOp(ComputeClimateDiagnosticsContract, { strategies });
