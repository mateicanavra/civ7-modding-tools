import { createOp } from "@swooper/mapgen-core/authoring";

import PlotEffectsScoreSandContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Scores warm, arid, sparse, unfrozen land in admitted biomes for sand plot-effect intent. */
export default createOp(PlotEffectsScoreSandContract, { strategies });
