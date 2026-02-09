import { Type, createStage } from "@swooper/mapgen-core/authoring";

/**
 * M3 topology placeholder stage.
 *
 * Slice M3-006 will implement deterministic wet-family planning here.
 */
const knobsSchema = Type.Object({}, { additionalProperties: false });

export default createStage({
  id: "ecology-wetlands",
  knobsSchema,
  steps: [],
} as const);

