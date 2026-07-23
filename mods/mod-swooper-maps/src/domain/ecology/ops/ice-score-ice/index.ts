import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreIceContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Scores sea and alpine ice suitability from temperature, elevation, freeze persistence, and land-water state. */
export default createOp(ScoreIceContract, { strategies });
