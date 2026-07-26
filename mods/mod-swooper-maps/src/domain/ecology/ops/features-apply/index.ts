import { createOp } from "@swooper/mapgen-core/authoring";

import FeaturesApplyContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Merges feature-family plans into one deterministic placement sequence and rejects multiple features on the same tile. */
export default createOp(FeaturesApplyContract, { strategies });
