import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreWetTundraBogContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Scores cold hydromorphic land from atmospheric moisture, freeze, and temperature. */
export default createOp(ScoreWetTundraBogContract, { strategies });
