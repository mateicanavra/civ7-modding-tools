import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeSegmentEventsContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Emits convergence, divergence, and transform events from the canonical segment table. */
const computeSegmentEvents = createOp(ComputeSegmentEventsContract, {
  strategies,
});

export default computeSegmentEvents;
