import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreWetMangroveContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Scores warm marine intertidal habitat from fertility, aridity, and temperature evidence. */
export default createOp(ScoreWetMangroveContract, { strategies });
