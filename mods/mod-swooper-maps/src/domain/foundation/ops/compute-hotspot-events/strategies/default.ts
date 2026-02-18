import { createStrategy } from "@swooper/mapgen-core/authoring";

import { buildHotspotEvents, requireMantleForcing, requireMesh } from "../rules/index.js";
import ComputeHotspotEventsContract from "../contract.js";

export const defaultStrategy = createStrategy(ComputeHotspotEventsContract, "default", {
  run: (input) => {
    const mesh = requireMesh(input.mesh, "foundation/compute-hotspot-events");
    const mantleForcing = requireMantleForcing(
      input.mantleForcing,
      mesh.cellCount | 0,
      "foundation/compute-hotspot-events"
    );
    const plateIds = Int16Array.from(input.eraPlateId);
    const events = buildHotspotEvents({ mesh, mantleForcing, eraPlateId: plateIds });
    return { events } as const;
  },
});
