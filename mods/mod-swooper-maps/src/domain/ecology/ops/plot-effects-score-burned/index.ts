import { createOp } from "@swooper/mapgen-core/authoring";

import PlotEffectsScoreBurnedContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const scorePlotEffectsBurned = createOp(PlotEffectsScoreBurnedContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export type * from "./contract.js";

export default scorePlotEffectsBurned;

