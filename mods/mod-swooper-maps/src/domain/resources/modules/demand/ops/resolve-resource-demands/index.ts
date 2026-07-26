import { createOp } from "@swooper/mapgen-core/authoring";

import ResolveResourceDemandsContract from "./contract.js";
import strategies from "./strategies/index.js";

/**
 * Resolves family planner evidence into policy-legal, river-free demands for deterministic site
 * selection.
 */
export default createOp(ResolveResourceDemandsContract, { strategies });
