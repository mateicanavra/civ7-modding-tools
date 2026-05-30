import { Type, createStage } from "@swooper/mapgen-core/authoring";
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
  knobsSchema: Type.Object({}),
  steps: [
    steps.scoreLayers,
    steps.planIce,
    steps.planReefs,
    steps.planWetlands,
    steps.planVegetation,
    steps.planPlotEffects,
  ],
} as const);
