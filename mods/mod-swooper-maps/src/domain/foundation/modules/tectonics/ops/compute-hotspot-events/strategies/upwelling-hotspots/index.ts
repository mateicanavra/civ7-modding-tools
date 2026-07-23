import { createStrategy } from "@swooper/mapgen-core/authoring";
import ComputeHotspotEventsContract from "../../contract.js";
import { buildHotspotEvents } from "../../rules/index.js";
import UpwellingHotspotsDefinition from "./config.js";

/** Attaches mantle-upwelling hotspot selection to the hotspot-event operation contract. */
export default createStrategy(ComputeHotspotEventsContract, UpwellingHotspotsDefinition, {
  run: (input) => {
    const mesh = input.mesh;
    const mantleForcing = input.mantleForcing;
    const plateIds = Int16Array.from(input.eraPlateId);
    const events = buildHotspotEvents({ mesh, mantleForcing, eraPlateId: plateIds });
    return { events } as const;
  },
});
