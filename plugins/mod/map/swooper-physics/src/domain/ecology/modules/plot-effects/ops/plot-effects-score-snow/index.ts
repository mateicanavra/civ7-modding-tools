import { createOp } from "@swooper/mapgen-core/authoring";

import PlotEffectsScoreSnowContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Scores cold land from freeze, elevation, and moisture under authored temperature and aridity limits. */
export default createOp(PlotEffectsScoreSnowContract, { strategies });
