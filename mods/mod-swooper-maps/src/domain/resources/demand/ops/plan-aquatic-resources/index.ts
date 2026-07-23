import { createOp } from "@swooper/mapgen-core/authoring";

import PlanAquaticResourcesContract from "./contract.js";
import { canonicalDemandStrategy } from "./strategies/index.js";

/**
 * Plans warning-only aquatic demand from earthlike expectations and named water habitats. It
 * reports evidence and blockers without selecting concrete sites.
 */
const planAquaticResources = createOp(PlanAquaticResourcesContract, {
  strategies: { "canonical-demand": canonicalDemandStrategy },
});

export type * from "./contract.js";
export type * from "./types.js";

export default planAquaticResources;
