import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeHotspotEventsContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const computeHotspotEvents = createOp(ComputeHotspotEventsContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export default computeHotspotEvents;
