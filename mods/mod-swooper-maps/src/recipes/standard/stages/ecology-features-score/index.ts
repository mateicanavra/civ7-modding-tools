import { Type, createStage } from "@swooper/mapgen-core/authoring";

/**
 * M3 topology placeholder stage.
 *
 * Slice M3-003 will implement scoreLayers artifacts + ops and add the `score-layers` step here.
 */
export default createStage({
  id: "ecology-features-score",
  knobsSchema: Type.Object({}),
  steps: [],
} as const);
