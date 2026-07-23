import { createStrategy } from "@swooper/mapgen-core/authoring";
import ComputeSegmentEventsContract from "../contract.js";
import { buildBoundaryEventsFromSegments } from "../rules/index.js";

/** Attaches boundary-segment event derivation to the segment-event operation contract. */
export const boundaryDerivedStrategy = createStrategy(
  ComputeSegmentEventsContract,
  "boundary-derived",
  {
    run: (input) => {
      const mesh = input.mesh;
      const crust = input.crust;
      const events = buildBoundaryEventsFromSegments({ mesh, crust, segments: input.segments });
      return { events } as const;
    },
  }
);
