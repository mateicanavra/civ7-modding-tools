import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeHotspotEventsContract from "./contract.js";
import { upwellingHotspotsStrategy } from "./strategies/index.js";

const computeHotspotEvents = createOp(ComputeHotspotEventsContract, {
  strategies: {
    "upwelling-hotspots": upwellingHotspotsStrategy,
  },
});

export default computeHotspotEvents;
