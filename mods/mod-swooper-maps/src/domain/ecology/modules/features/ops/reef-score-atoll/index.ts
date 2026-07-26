import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreAtollContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Scores warm offshore ocean banks within authored depth and coast-distance windows for atoll habitat. */
export default createOp(ScoreAtollContract, { strategies });
