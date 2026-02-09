import { Type, createStage } from "@swooper/mapgen-core/authoring";

/**
 * M3 topology placeholder stage.
 *
 * Slice M3-006 will implement deterministic wet-family planning here.
 */
export default createStage({
  id: "ecology-wetlands",
  knobsSchema: Type.Object({}),
  steps: [],
} as const);
