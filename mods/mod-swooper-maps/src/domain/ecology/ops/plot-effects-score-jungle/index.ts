import { createOp } from "@swooper/mapgen-core/authoring";

import PlotEffectsScoreJungleContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const scorePlotEffectsJungle = createOp(PlotEffectsScoreJungleContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export type * from "./contract.js";

export default scorePlotEffectsJungle;
