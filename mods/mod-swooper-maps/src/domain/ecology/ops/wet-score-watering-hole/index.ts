import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreWetWateringHoleContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Scores sparse arid habitat around isolated water points from water, fertility, aridity, and temperature. */
export default createOp(ScoreWetWateringHoleContract, { strategies });
