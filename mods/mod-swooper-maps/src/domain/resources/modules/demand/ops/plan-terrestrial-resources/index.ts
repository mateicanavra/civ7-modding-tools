import { createOp } from "@swooper/mapgen-core/authoring";

import PlanTerrestrialResourcesContract from "./contract.js";
import strategies from "./strategies/index.js";

/**
 * Plans warning-only terrestrial demand and family-owned land-ecology lanes. It reports evidence
 * gaps without selecting concrete sites.
 */
export default createOp(PlanTerrestrialResourcesContract, { strategies });
