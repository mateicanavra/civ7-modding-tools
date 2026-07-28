import { createOp } from "@swooper/mapgen-core/authoring";

import ClassifyRiverNetworkContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Classifies drainage topology, hierarchy, mouths, slopes, and permanence into measurable river evidence. */
export default createOp(ClassifyRiverNetworkContract, { strategies });
