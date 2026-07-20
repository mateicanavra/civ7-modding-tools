import { createOp } from "@swooper/mapgen-core/authoring";

import PlanGeologicalResourcesContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

/**
 * Plans warning-only geological demand and family-owned substrate lanes. It reports evidence
 * gaps without selecting concrete sites.
 */
const planGeologicalResources = createOp(PlanGeologicalResourcesContract, {
  strategies: { default: defaultStrategy },
});

export type * from "./contract.js";
export type * from "./types.js";

export default planGeologicalResources;
