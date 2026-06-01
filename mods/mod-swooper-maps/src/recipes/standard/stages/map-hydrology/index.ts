import { createStage } from "@swooper/mapgen-core/authoring";
import {
  MapHydrologyKnobsSchema,
  MapHydrologyPublicSchema,
} from "../map-projection-public-config.js";
import { lakes } from "./steps/index.js";

export default createStage({
  id: "map-hydrology",
  knobsSchema: MapHydrologyKnobsSchema,
  public: MapHydrologyPublicSchema,
  compile: () => ({
    lakes: { projectionReadback: true },
  }),
  steps: [lakes],
} as const);
