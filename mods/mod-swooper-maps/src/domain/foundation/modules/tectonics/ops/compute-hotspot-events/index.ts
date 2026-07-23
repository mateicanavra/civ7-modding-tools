import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeHotspotEventsContract from "./contract.js";
import { upwellingHotspotsStrategy } from "./strategies/index.js";

/** Produces the hotspot event stream merged with boundary events during era reconstruction. */
const computeHotspotEvents = createOp(ComputeHotspotEventsContract, {
  strategies: {
    "upwelling-hotspots": upwellingHotspotsStrategy,
  },
});

export default computeHotspotEvents;
