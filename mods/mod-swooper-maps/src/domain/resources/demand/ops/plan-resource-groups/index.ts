import { createOp } from "@swooper/mapgen-core/authoring";

import PlanResourceGroupsContract from "./contract.js";
import { canonicalRollupStrategy } from "./strategies/index.js";

/**
 * Reconciles the four family demand plans into one warning-only coverage report while preserving
 * family rows and surfacing duplicate ownership, blockers, and aggregate counts.
 */
const planResourceGroups = createOp(PlanResourceGroupsContract, {
  strategies: { "canonical-rollup": canonicalRollupStrategy },
});

export type * from "./contract.js";
export type * from "./types.js";

export default planResourceGroups;
