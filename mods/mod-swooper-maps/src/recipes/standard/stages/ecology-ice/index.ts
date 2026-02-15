import { Type, createStage } from "@swooper/mapgen-core/authoring";

/**
 * M3 topology placeholder stage.
 *
 * Slice M3-004 will implement deterministic ice planning + occupancy snapshots here.
 */
export default createStage({
  id: "ecology-ice",
  knobsSchema: Type.Object({}),
  steps: [],
} as const);
