import { createOp } from "@swooper/mapgen-core/authoring";

import DeriveHabitatFieldsContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

/**
 * Derives the exact resource-family habitat masks and intensity fields from upstream morphology,
 * hydrology, and ecology truth.
 */
const deriveHabitatFields = createOp(DeriveHabitatFieldsContract, {
  strategies: { default: defaultStrategy },
});

export type * from "./contract.js";
export type * from "./types.js";

export default deriveHabitatFields;
