import { createStrategy } from "@swooper/mapgen-core/authoring";
import ComputeHotspotEventsContract from "../../contract.js";
import { buildHotspotEvents } from "../../rules/index.js";
import UpwellingHotspotsDefinition from "./config.js";

/**
 * Selects hotspot events from mantle upwelling in the context of the reconstructed era's plate
 * membership. Copying membership into a fixed-width field keeps event ownership aligned with the
 * admitted mesh vintage.
 */
export default createStrategy(ComputeHotspotEventsContract, UpwellingHotspotsDefinition, {
  run: (input) => {
    const mesh = input.mesh;
    const mantleForcing = input.mantleForcing;
    const events = buildHotspotEvents({ mesh, mantleForcing, eraPlateId: input.eraPlateId });
    return { events } as const;
  },
});
