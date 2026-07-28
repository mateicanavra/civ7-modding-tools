import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreWetMangroveContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Scores warm intertidal coast habitat from water, fertility, aridity, and temperature evidence. */
export default createOp(ScoreWetMangroveContract, { strategies });
