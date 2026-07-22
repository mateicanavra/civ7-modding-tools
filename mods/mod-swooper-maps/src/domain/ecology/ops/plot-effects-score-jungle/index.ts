import { createOp } from "@swooper/mapgen-core/authoring";

import PlotEffectsScoreJungleContract from "./contract.js";
import { hotWetDenseStrategy } from "./strategies/index.js";

const scorePlotEffectsJungle = createOp(PlotEffectsScoreJungleContract, {
  strategies: {
    "hot-wet-dense": hotWetDenseStrategy,
  },
});

export type * from "./contract.js";

export default scorePlotEffectsJungle;
