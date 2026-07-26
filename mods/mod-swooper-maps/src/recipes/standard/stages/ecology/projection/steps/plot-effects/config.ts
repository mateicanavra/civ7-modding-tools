import { artifacts as plotEffectArtifacts } from "@mapgen/domain/ecology/modules/plot-effects/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";
import { STANDARD_ENGINE_EFFECT_TAGS } from "../../../../../tag-contracts.js";

/**
 * Plot-effect projection contract.
 *
 * Planning moved upstream to `ecology-features/plan-plot-effects`; this map
 * step only applies the published plan to Civ7 and emits projection viz.
 */
export const config = defineStep({
  id: "plot-effects",
  description: "Applies admitted Ecology plot-effect intent to the current Civ7 map.",
  engine: ["getPlotEffectTypeIndex", "addPlotEffect"] as const,
  requires: [],
  provides: [STANDARD_ENGINE_EFFECT_TAGS.engine.plotEffectsApplied],
  artifacts: {
    requires: [plotEffectArtifacts.plotEffectPlan],
  },
});
