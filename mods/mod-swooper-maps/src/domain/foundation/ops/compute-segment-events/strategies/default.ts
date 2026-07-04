import { createStrategy } from "@swooper/mapgen-core/authoring";
import ComputeSegmentEventsContract from "../contract.js";
import { buildBoundaryEventsFromSegments } from "../rules/index.js";

export const defaultStrategy = createStrategy(ComputeSegmentEventsContract, "default", {
  run: (input) => {
    const mesh = input.mesh;
    const crust = input.crust;
    const cellCount = mesh.cellCount | 0;
    if (crust.type.length !== cellCount || crust.strength.length !== cellCount) {
      throw new Error("[Foundation] Invalid crust.cellCount for compute-segment-events.");
    }

    const events = buildBoundaryEventsFromSegments({ mesh, crust, segments: input.segments });
    return { events } as const;
  },
});
