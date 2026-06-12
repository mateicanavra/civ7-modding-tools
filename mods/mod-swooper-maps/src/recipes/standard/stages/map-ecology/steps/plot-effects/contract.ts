import { Type, defineStep } from "@swooper/mapgen-core/authoring";

import { ecologyArtifacts } from "../../../ecology/artifacts.js";
import { STANDARD_ENGINE_EFFECT_TAGS } from "../../../../tags.js";

/**
 * Plot-effect projection contract.
 *
 * Planning moved upstream to `ecology-features/plan-plot-effects`; this map
 * step only applies the published plan to Civ7 and emits projection viz.
 */
const PlotEffectsStepContract = defineStep({
  id: "plot-effects",
  phase: "ecology",
  requires: [],
  provides: [STANDARD_ENGINE_EFFECT_TAGS.engine.plotEffectsApplied],
  artifacts: {
    requires: [ecologyArtifacts.plotEffectPlan],
  },
  schema: Type.Object(
    {},
    {
      description: "Projection-only application for planned plot effects.",
    }
  ),
});

export default PlotEffectsStepContract;
