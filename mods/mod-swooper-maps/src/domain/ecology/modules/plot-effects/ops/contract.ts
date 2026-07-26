import PlanPlotEffectsContract from "./plan-plot-effects/contract.js";
import PlotEffectsScoreBurnedContract from "./plot-effects-score-burned/contract.js";
import PlotEffectsScoreJungleContract from "./plot-effects-score-jungle/contract.js";
import PlotEffectsScoreSandContract from "./plot-effects-score-sand/contract.js";
import PlotEffectsScoreSnowContract from "./plot-effects-score-snow/contract.js";

/** Plot-effect operation contracts keyed in causal execution order. */
const contracts = {
  scorePlotEffectsSnow: PlotEffectsScoreSnowContract,
  scorePlotEffectsSand: PlotEffectsScoreSandContract,
  scorePlotEffectsBurned: PlotEffectsScoreBurnedContract,
  scorePlotEffectsJungle: PlotEffectsScoreJungleContract,
  planPlotEffects: PlanPlotEffectsContract,
} as const;

export default contracts;
