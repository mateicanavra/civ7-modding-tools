import { createOp } from "@swooper/mapgen-core/authoring";

import PlotEffectsScoreSandContract from "./contract.js";
import { aridThermalStrategy } from "./strategies/index.js";

const scorePlotEffectsSand = createOp(PlotEffectsScoreSandContract, {
  strategies: {
    "arid-thermal": aridThermalStrategy,
  },
});

export type * from "./contract.js";

export default scorePlotEffectsSand;
