import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeSegmentEventsContract from "./contract.js";
import { boundaryDerivedStrategy } from "./strategies/index.js";

const computeSegmentEvents = createOp(ComputeSegmentEventsContract, {
  strategies: {
    "boundary-derived": boundaryDerivedStrategy,
  },
});

export default computeSegmentEvents;
