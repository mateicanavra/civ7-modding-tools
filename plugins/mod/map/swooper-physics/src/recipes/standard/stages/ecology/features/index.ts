import { createStage } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../../contract-manifest.js";
import { PlanFloodplainsStep } from "./steps/plan-floodplains/step.js";
import { PlanIceStep } from "./steps/plan-ice/step.js";
import { PlanPlotEffectsStep } from "./steps/plan-plot-effects/step.js";
import { PlanReefsStep } from "./steps/plan-reefs/step.js";
import { PlanVegetationStep } from "./steps/plan-vegetation/step.js";
import { PlanWetlandsStep } from "./steps/plan-wetlands/step.js";
import { ScoreLayersStep } from "./steps/score-layers/step.js";

/**
 * Ecology feature planning stage.
 *
 * Feature-family planners share one suitability product and publish admitted intent artifacts in
 * causal order. Keeping them in one stage preserves the real planning boundary without promoting
 * individual feature families into fake recipe-level stage identities.
 */
export default createStage({
  id: "ecology-features",
  steps: orderStandardStageSteps("ecology-features", {
    "score-layers": ScoreLayersStep,
    "plan-floodplains": PlanFloodplainsStep,
    "plan-ice": PlanIceStep,
    "plan-reefs": PlanReefsStep,
    "plan-wetlands": PlanWetlandsStep,
    "plan-vegetation": PlanVegetationStep,
    "plan-plot-effects": PlanPlotEffectsStep,
  }),
} as const);
