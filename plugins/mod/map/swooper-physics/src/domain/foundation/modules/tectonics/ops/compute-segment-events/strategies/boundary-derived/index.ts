import { createStrategy } from "@swooper/mapgen-core/authoring";
import ComputeSegmentEventsContract from "../../contract.js";
import { buildBoundaryEventsFromSegments } from "../../rules/index.js";
import BoundaryDerivedDefinition from "./config.js";

/**
 * Converts classified boundary segments into tectonic events using their regime, polarity,
 * intensity, and local crust context. It preserves segment-derived causality instead of
 * reclassifying boundaries at the event layer.
 */
export default createStrategy(ComputeSegmentEventsContract, BoundaryDerivedDefinition, {
  run: (input) => {
    const mesh = input.mesh;
    const crust = input.crust;
    const events = buildBoundaryEventsFromSegments({ mesh, crust, segments: input.segments });
    return { events } as const;
  },
});
