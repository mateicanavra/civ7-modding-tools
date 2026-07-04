import { createStrategy } from "@swooper/mapgen-core/authoring";
import ComputeHotspotEventsContract from "../contract.js";
import { buildHotspotEvents } from "../rules/index.js";

export const defaultStrategy = createStrategy(ComputeHotspotEventsContract, "default", {
  run: (input) => {
    const mesh = input.mesh;
    const mantleForcing = input.mantleForcing;
    const cellCount = mesh.cellCount | 0;
    if ((mantleForcing.cellCount | 0) !== cellCount) {
      throw new Error("[Foundation] Invalid mantleForcing.cellCount for compute-hotspot-events.");
    }
    if (input.eraPlateId.length !== cellCount) {
      throw new Error("[Foundation] Invalid eraPlateId.cellCount for compute-hotspot-events.");
    }

    const plateIds = Int16Array.from(input.eraPlateId);
    const events = buildHotspotEvents({ mesh, mantleForcing, eraPlateId: plateIds });
    return { events } as const;
  },
});
