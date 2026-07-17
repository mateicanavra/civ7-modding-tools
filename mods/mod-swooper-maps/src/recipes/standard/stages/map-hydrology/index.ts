import { createStage } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import {
  MapHydrologyKnobsSchema,
  MapHydrologyPublicSchema,
} from "../map-projection-public-config.js";
import { lakes } from "./steps/index.js";

/**
 * Owns lake projection and readback only, compiling upstream Hydrology intent
 * into the engine-facing step without introducing a second lake policy.
 */
export default createStage({
  id: "map-hydrology",
  knobsSchema: MapHydrologyKnobsSchema,
  public: MapHydrologyPublicSchema,
  compile: () => ({
    lakes: { projectionReadback: true },
  }),
  steps: orderStandardStageSteps("map-hydrology", { lakes }),
} as const);
