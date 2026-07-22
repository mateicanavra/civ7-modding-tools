import { createOp } from "@swooper/mapgen-core/authoring";

import PlotEffectsScoreSnowContract from "./contract.js";
import { coldElevationStrategy } from "./strategies/index.js";

const scorePlotEffectsSnow = createOp(PlotEffectsScoreSnowContract, {
  strategies: {
    "cold-elevation": coldElevationStrategy,
  },
});

export type * from "./contract.js";

export default scorePlotEffectsSnow;
