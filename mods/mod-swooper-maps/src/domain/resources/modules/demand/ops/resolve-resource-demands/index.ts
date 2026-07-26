import { createOp } from "@swooper/mapgen-core/authoring";

import ResolveResourceDemandsContract from "./contract.js";
import strategies from "./strategies/index.js";

/**
 * Resolves the canonical resource corpus into habitat-bound, policy-legal, river-free terminal
 * demands for deterministic site selection.
 */
export default createOp(ResolveResourceDemandsContract, { strategies });
