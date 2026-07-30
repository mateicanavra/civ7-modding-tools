import { createOp } from "@swooper/mapgen-core/authoring";

import PlotEffectsScoreJungleContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Scores hot, wet, densely vegetated rainforest for jungle plot-effect intent. */
export default createOp(PlotEffectsScoreJungleContract, { strategies });
