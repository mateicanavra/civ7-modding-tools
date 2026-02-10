import { Type, createStage } from "@swooper/mapgen-core/authoring";

/**
 * M3 topology placeholder stage.
 *
 * Slice M3-005 will implement deterministic reef-family planning here.
 */
export default createStage({
  id: "ecology-reefs",
  knobsSchema: Type.Object({}),
  steps: [],
} as const);
