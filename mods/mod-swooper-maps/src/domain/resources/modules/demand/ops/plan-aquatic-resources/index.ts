import { createOp } from "@swooper/mapgen-core/authoring";

import PlanAquaticResourcesContract from "./contract.js";
import strategies from "./strategies/index.js";

/**
 * Plans warning-only aquatic demand from earthlike expectations and named water habitats. It
 * reports evidence and blockers without selecting concrete sites.
 */
export default createOp(PlanAquaticResourcesContract, { strategies });
