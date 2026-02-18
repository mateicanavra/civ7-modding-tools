import { createOp } from "@swooper/mapgen-core/authoring";

import { requireCrust, requireMesh } from "../../lib/require.js";
import { buildBoundaryEventsFromSegments } from "../compute-tectonic-history/lib/pipeline-core.js";
import ComputeSegmentEventsContract from "./contract.js";

const computeSegmentEvents = createOp(ComputeSegmentEventsContract, {
  strategies: {
    default: {
      run: (input) => {
        const mesh = requireMesh(input.mesh, "foundation/compute-segment-events");
        const crust = requireCrust(input.crust, mesh.cellCount | 0, "foundation/compute-segment-events");
        const events = buildBoundaryEventsFromSegments({ mesh, crust, segments: input.segments });
        return { events } as const;
      },
    },
  },
});

export default computeSegmentEvents;
