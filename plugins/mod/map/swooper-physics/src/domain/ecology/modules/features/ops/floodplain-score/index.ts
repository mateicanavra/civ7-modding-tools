import { createOp } from "@swooper/mapgen-core/authoring";

import FloodplainScoreContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Scores biome-specific minor and navigable floodplain habitat from alluvial evidence. */
export default createOp(FloodplainScoreContract, { strategies });
