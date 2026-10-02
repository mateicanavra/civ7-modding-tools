import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreIceContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Scores marine ice suitability from current climate temperature and external-water eligibility. */
export default createOp(ScoreIceContract, { strategies });
