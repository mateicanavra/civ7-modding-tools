import { createOp } from "@swooper/mapgen-core/authoring";

import { requireMantleForcing, requireMesh } from "../../lib/require.js";
import { buildHotspotEvents } from "../compute-tectonic-history/lib/pipeline-core.js";
import ComputeHotspotEventsContract from "./contract.js";

const computeHotspotEvents = createOp(ComputeHotspotEventsContract, {
  strategies: {
    default: {
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
    },
  },
});

export default computeHotspotEvents;
