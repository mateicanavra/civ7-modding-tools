import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreWetTundraBogContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Scores cold saturated land from hydromorphic substrate, water, fertility, freeze, and temperature. */
export default createOp(ScoreWetTundraBogContract, { strategies });
