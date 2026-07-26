import { createStage } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import { FeaturesApplyStep } from "./steps/features-apply/step.js";
import { PlotBiomesStep } from "./steps/plot-biomes/step.js";
import { PlotEffectsStep } from "./steps/plot-effects/step.js";

/**
 * Engine-facing Ecology projection.
 *
 * Biomes, feature intents, and plot-effect plans are decided by Ecology truth
 * stages. This stage only binds those artifacts into Civ7 runtime state, which
 * keeps engine adapter concerns out of planning policy.
 */
export default createStage({
  id: "map-ecology",
  // The apply operation is fixed projection policy, not an author-facing envelope.
  compile: () => ({}),
  steps: orderStandardStageSteps("map-ecology", {
    "plot-biomes": PlotBiomesStep,
    "features-apply": FeaturesApplyStep,
    "plot-effects": PlotEffectsStep,
  }),
} as const);
