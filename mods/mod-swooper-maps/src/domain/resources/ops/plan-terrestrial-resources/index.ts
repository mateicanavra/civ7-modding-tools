import { createOp } from "@swooper/mapgen-core/authoring";

import PlanTerrestrialResourcesContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

/**
 * Plans warning-only terrestrial demand and family-owned land-ecology lanes. It reports evidence
 * gaps without selecting concrete sites.
 */
const planTerrestrialResources = createOp(PlanTerrestrialResourcesContract, {
  strategies: { default: defaultStrategy },
});

export type * from "./contract.js";
export type * from "./types.js";

export default planTerrestrialResources;
