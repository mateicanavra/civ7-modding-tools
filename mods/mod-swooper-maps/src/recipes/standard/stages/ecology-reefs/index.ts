import { Type, createStage } from "@swooper/mapgen-core/authoring";

/**
 * M3 topology placeholder stage.
 *
 * Slice M3-005 will implement deterministic reef-family planning here.
 */
const knobsSchema = Type.Object({}, { additionalProperties: false });

export default createStage({
  id: "ecology-reefs",
  knobsSchema,
  steps: [],
} as const);

