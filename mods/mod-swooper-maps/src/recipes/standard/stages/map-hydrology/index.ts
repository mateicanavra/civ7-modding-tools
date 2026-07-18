import { createStage } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import {
  MapHydrologyKnobsSchema,
  MapHydrologyPublicSchema,
} from "../map-projection-public-config.js";
import { lakes, projectRainfall } from "./steps/index.js";

/**
 * Owns Hydrology-to-engine materialization: final rainfall first, then lake
 * projection and readback, without introducing a second climate or lake policy.
 */
export default createStage({
  id: "map-hydrology",
  knobsSchema: MapHydrologyKnobsSchema,
  public: MapHydrologyPublicSchema,
  compile: () => ({
    "project-rainfall": {},
    lakes: { projectionReadback: true },
  }),
  steps: orderStandardStageSteps("map-hydrology", {
    "project-rainfall": projectRainfall,
    lakes,
  }),
} as const);
