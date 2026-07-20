import { createStage } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import {
  MapHydrologyKnobsSchema,
  MapHydrologyPublicSchema,
} from "../map-projection-public-config.js";
import { LakesStep } from "./steps/lakes/step.js";
import { ProjectRainfallStep } from "./steps/project-rainfall/step.js";

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
    "project-rainfall": ProjectRainfallStep,
    lakes: LakesStep,
  }),
} as const);
