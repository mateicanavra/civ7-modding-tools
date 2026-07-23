import { createOp } from "@swooper/mapgen-core/authoring";

import PlanGeologicalResourcesContract from "./contract.js";
import strategies from "./strategies/index.js";

/**
 * Plans warning-only geological demand and family-owned substrate lanes. It reports evidence
 * gaps without selecting concrete sites.
 */
export default createOp(PlanGeologicalResourcesContract, { strategies });
