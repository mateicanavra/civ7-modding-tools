import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreColdReefContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Scores cold shelf water within authored temperature, depth, and coast-distance windows. */
export default createOp(ScoreColdReefContract, { strategies });
