import { createOp } from "@swooper/mapgen-core/authoring";

import AdjustResourceSupportContract from "./contract.js";
import { supportEquityStrategy } from "./strategies/index.js";

/**
 * Moves or adds pre-stamp resource intents to improve start support. Adjusted destinations pass
 * hard legality, spacing, range, exclusion, region, and landmass gates; affinity remains a
 * scoring preference, and unresolved targets retain typed shortfall evidence.
 */
const adjustResourceSupport = createOp(AdjustResourceSupportContract, {
  strategies: { "support-equity": supportEquityStrategy },
});

export type * from "./contract.js";
export type * from "./types.js";

export default adjustResourceSupport;
