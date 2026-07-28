import { artifacts as plotEffectArtifacts } from "../../../../../../../domain/ecology/modules/plot-effects/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Plot-effect projection contract.
 *
 * Planning moved upstream to `ecology-features/plan-plot-effects`; this map
 * step only applies the published plan to Civ7 and emits projection viz in
 * authored recipe order.
 */
export const config = defineStep({
  id: "plot-effects",
  description: "Applies admitted Ecology plot-effect intent to the current Civ7 map.",
  engine: ["getPlotEffectTypeIndex", "addPlotEffect"] as const,
  requires: [plotEffectArtifacts.plotEffectPlan],
  provides: [],
});
