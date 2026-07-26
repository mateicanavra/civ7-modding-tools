import { createOp } from "@swooper/mapgen-core/authoring";

import PlanResourceGroupsContract from "./contract.js";
import strategies from "./strategies/index.js";

/**
 * Reconciles the four family demand plans into one warning-only coverage report while preserving
 * family rows and surfacing duplicate ownership, blockers, and aggregate counts.
 */
export default createOp(PlanResourceGroupsContract, { strategies });
