import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";

import planPlotEffects from "./plan-plot-effects/index.js";
import scorePlotEffectsBurned from "./plot-effects-score-burned/index.js";
import scorePlotEffectsJungle from "./plot-effects-score-jungle/index.js";
import scorePlotEffectsSand from "./plot-effects-score-sand/index.js";
import scorePlotEffectsSnow from "./plot-effects-score-snow/index.js";

type Contracts = typeof import("./contract.js").default;

/** Plot-effect implementations keyed exactly like the branch contract registry. */
const implementations = {
  scorePlotEffectsSnow,
  scorePlotEffectsSand,
  scorePlotEffectsBurned,
  scorePlotEffectsJungle,
  planPlotEffects,
} as const satisfies DomainOpImplementationsForContracts<Contracts>;

export default implementations;
