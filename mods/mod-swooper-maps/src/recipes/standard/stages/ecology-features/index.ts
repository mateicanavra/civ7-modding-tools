import { createStage, Type } from "@swooper/mapgen-core/authoring";
import {
  compileEcologyFeaturesPublicConfig,
  EcologyFeaturesPublicSchema,
} from "../ecology-public-config.js";
import { steps } from "./steps/index.js";

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
  steps: [
    steps.scoreLayers,
    steps.planFloodplains,
    steps.planIce,
    steps.planReefs,
    steps.planWetlands,
    steps.planVegetation,
    steps.planPlotEffects,
  ],
  compile: ({ config }: { config: Record<string, unknown> }) =>
    compileEcologyFeaturesPublicConfig(config),
} as const);
