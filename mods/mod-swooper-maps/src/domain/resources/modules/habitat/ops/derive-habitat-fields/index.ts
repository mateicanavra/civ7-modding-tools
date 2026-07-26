import { createOp } from "@swooper/mapgen-core/authoring";

import DeriveHabitatFieldsContract from "./contract.js";
import strategies from "./strategies/index.js";

/**
 * Derives the exact resource-family habitat masks and intensity fields from upstream morphology,
 * hydrology, and ecology truth.
 */
export default createOp(DeriveHabitatFieldsContract, { strategies });
