import { createOp } from "@swooper/mapgen-core/authoring";

import PlanTerrestrialResourcesContract from "./contract.js";
import { canonicalDemandStrategy } from "./strategies/index.js";

/**
 * Plans warning-only terrestrial demand and family-owned land-ecology lanes. It reports evidence
 * gaps without selecting concrete sites.
 */
const planTerrestrialResources = createOp(PlanTerrestrialResourcesContract, {
  strategies: { "canonical-demand": canonicalDemandStrategy },
});

export type * from "./contract.js";
export type * from "./types.js";

export default planTerrestrialResources;
