import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanWondersContract from "../../contract.js";
import MapMetadataDefinition from "./config.js";

/**
 * Derives the natural-wonder target by rounding the finite map metadata count and clamping it
 * at zero. Missing or nonnumeric metadata deterministically yields zero rather than inventing
 * a default.
 */
const mapMetadata = createStrategy(PlanWondersContract, MapMetadataDefinition, {
  run: (input) => {
    const mapInfo = input.mapInfo;
    let wondersCount = 0;

    if (mapInfo && typeof mapInfo.NumNaturalWonders === "number") {
      wondersCount = Math.max(0, Math.round(mapInfo.NumNaturalWonders));
    }

    return { wondersCount };
  },
});

export default mapMetadata;
