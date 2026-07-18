import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import {
  compileEcologyFeaturesPublicConfig,
  EcologyFeaturesPublicSchema,
} from "../ecology-public-config.js";
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
 * The feature-family operations share one ordered occupancy pipeline. Keeping
 * them in one stage preserves the real handoff surface (score layers plus
 * occupancy snapshots) without promoting vegetation/ice/reef/wetland wrappers
 * into fake recipe-level stage identities.
 */
export default createStage({
  id: "ecology-features",
  knobsSchema: Type.Object(
    {},
    {
      additionalProperties: false,
      description:
        "Ecology-features currently has no stage-level knobs; authoring control lives in feature scoring and planning groups.",
    }
  ),
  public: EcologyFeaturesPublicSchema,
  steps: orderStandardStageSteps("ecology-features", {
    "score-layers": ScoreLayersStep,
    "plan-floodplains": PlanFloodplainsStep,
    "plan-ice": PlanIceStep,
    "plan-reefs": PlanReefsStep,
    "plan-wetlands": PlanWetlandsStep,
    "plan-vegetation": PlanVegetationStep,
    "plan-plot-effects": PlanPlotEffectsStep,
  }),
  compile: ({ config }: { config: Record<string, unknown> }) =>
    compileEcologyFeaturesPublicConfig(config),
} as const);
