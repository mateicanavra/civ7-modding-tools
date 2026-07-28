import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";

import PlanPlotEffectsContract from "./ops/plan-plot-effects/contract.js";
import PlotEffectsScoreBurnedContract from "./ops/plot-effects-score-burned/contract.js";
import PlotEffectsScoreJungleContract from "./ops/plot-effects-score-jungle/contract.js";
import PlotEffectsScoreSandContract from "./ops/plot-effects-score-sand/contract.js";
import PlotEffectsScoreSnowContract from "./ops/plot-effects-score-snow/contract.js";

/** Plot-effect branch contract for scoring and ranked-coverage planning. */
const plotEffects = defineDomainSubdomain({
  id: "plotEffects",
  ops: {
    scorePlotEffectsSnow: PlotEffectsScoreSnowContract,
    scorePlotEffectsSand: PlotEffectsScoreSandContract,
    scorePlotEffectsBurned: PlotEffectsScoreBurnedContract,
    scorePlotEffectsJungle: PlotEffectsScoreJungleContract,
    planPlotEffects: PlanPlotEffectsContract,
  },
});

export default plotEffects;
