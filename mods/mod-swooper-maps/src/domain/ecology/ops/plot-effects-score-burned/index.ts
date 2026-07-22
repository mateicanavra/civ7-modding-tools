import { createOp } from "@swooper/mapgen-core/authoring";

import PlotEffectsScoreBurnedContract from "./contract.js";
import { aridThermalStrategy } from "./strategies/index.js";

const scorePlotEffectsBurned = createOp(PlotEffectsScoreBurnedContract, {
  strategies: {
    "arid-thermal": aridThermalStrategy,
  },
});

export type * from "./contract.js";

export default scorePlotEffectsBurned;
