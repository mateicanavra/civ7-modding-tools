import { createOp } from "@swooper/mapgen-core/authoring";

import PlanCultivatedResourcesContract from "./contract.js";
import strategies from "./strategies/index.js";

/**
 * Plans warning-only cultivated demand and family-owned agriculture lanes. It reports evidence
 * gaps without selecting concrete sites.
 */
export default createOp(PlanCultivatedResourcesContract, { strategies });
