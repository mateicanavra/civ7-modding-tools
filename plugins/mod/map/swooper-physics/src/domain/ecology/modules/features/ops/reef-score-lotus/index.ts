import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreLotusContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Scores warm shallow lake water near shore for lake-lotus habitat. */
export default createOp(ScoreLotusContract, { strategies });
