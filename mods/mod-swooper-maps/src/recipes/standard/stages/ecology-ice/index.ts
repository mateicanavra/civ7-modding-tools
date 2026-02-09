import { Type, createStage } from "@swooper/mapgen-core/authoring";

/**
 * M3 topology placeholder stage.
 *
 * Slice M3-004 will implement deterministic ice planning + occupancy snapshots here.
 */
const knobsSchema = Type.Object({}, { additionalProperties: false });

export default createStage({
  id: "ecology-ice",
  knobsSchema,
  steps: [],
} as const);

