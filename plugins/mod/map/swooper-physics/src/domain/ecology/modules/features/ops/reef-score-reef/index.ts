import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreReefContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Scores warm coastal-shelf water within authored depth and coast-distance limits. */
export default createOp(ScoreReefContract, { strategies });
