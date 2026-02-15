import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeSegmentEventsContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const computeSegmentEvents = createOp(ComputeSegmentEventsContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export default computeSegmentEvents;
