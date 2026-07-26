import { createOp } from "@swooper/mapgen-core/authoring";

import AdjustResourceSupportContract from "./contract.js";
import strategies from "./strategies/index.js";

/**
 * Moves or adds pre-stamp resource intents to improve start support. Adjusted destinations pass
 * hard legality, spacing, range, exclusion, region, and landmass gates; affinity remains a
 * scoring preference, and unresolved targets retain typed shortfall evidence.
 */
export default createOp(AdjustResourceSupportContract, { strategies });
