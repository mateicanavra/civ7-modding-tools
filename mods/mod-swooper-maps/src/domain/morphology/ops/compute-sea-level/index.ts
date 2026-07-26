import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeSeaLevelContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Solves a sea-level datum against the authored hypsometry and water-coverage posture. */
const computeSeaLevel = createOp(ComputeSeaLevelContract, { strategies });

export default computeSeaLevel;
