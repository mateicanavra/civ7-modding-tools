import { createOp } from "@swooper/mapgen-core/authoring";

import PlotEffectsScoreSnowContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const scorePlotEffectsSnow = createOp(PlotEffectsScoreSnowContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export type * from "./contract.js";

export default scorePlotEffectsSnow;

