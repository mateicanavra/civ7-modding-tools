import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreWetOasisContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Scores warm arid land around isolated water points without treating broad wetlands as oasis habitat. */
export default createOp(ScoreWetOasisContract, { strategies });
