import { createOp } from "@swooper/mapgen-core/authoring";

import ProjectRiverNetworkContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Turns discharge distribution and routing into deterministic minor and major river intent. */
export default createOp(ProjectRiverNetworkContract, { strategies });
