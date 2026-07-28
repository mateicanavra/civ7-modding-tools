import { createOp } from "@swooper/mapgen-core/authoring";

import PlotEffectsScoreBurnedContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Scores hot, arid, sparse, unfrozen land in admitted biomes for burned plot-effect intent. */
export default createOp(PlotEffectsScoreBurnedContract, { strategies });
