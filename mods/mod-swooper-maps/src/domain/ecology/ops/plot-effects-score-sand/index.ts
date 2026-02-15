import { createOp } from "@swooper/mapgen-core/authoring";

import PlotEffectsScoreSandContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const scorePlotEffectsSand = createOp(PlotEffectsScoreSandContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export type * from "./contract.js";

export default scorePlotEffectsSand;

