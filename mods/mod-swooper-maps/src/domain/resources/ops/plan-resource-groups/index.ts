import { createOp } from "@swooper/mapgen-core/authoring";

import PlanResourceGroupsContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

/**
 * Reconciles the four family demand plans into one warning-only coverage report while preserving
 * family rows and surfacing duplicate ownership, blockers, and aggregate counts.
 */
const planResourceGroups = createOp(PlanResourceGroupsContract, {
  strategies: { default: defaultStrategy },
});

export type * from "./contract.js";
export type * from "./types.js";

export default planResourceGroups;
