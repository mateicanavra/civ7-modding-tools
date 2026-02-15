import { createStrategy } from "@swooper/mapgen-core/authoring";

import { buildBoundaryEventsFromSegments, requireCrust, requireMesh } from "../rules/index.js";
import ComputeSegmentEventsContract from "../contract.js";

export const defaultStrategy = createStrategy(ComputeSegmentEventsContract, "default", {
  run: (input) => {
    const mesh = requireMesh(input.mesh, "foundation/compute-segment-events");
    const crust = requireCrust(input.crust, mesh.cellCount | 0, "foundation/compute-segment-events");
    const events = buildBoundaryEventsFromSegments({ mesh, crust, segments: input.segments });
    return { events } as const;
  },
});
