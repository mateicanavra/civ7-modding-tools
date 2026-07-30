import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreWetMarshContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Scores temperate saturated land from hydromorphic substrate, water, fertility, aridity, and temperature. */
export default createOp(ScoreWetMarshContract, { strategies });
