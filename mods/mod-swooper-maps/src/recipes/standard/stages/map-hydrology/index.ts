import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import { lakes } from "./steps/index.js";

const MapHydrologyKnobsSchema = Type.Object(
  {},
  {
    additionalProperties: false,
    description: "Map hydrology knobs. Lake projection currently has no author-facing stage knobs.",
  }
);

const MapHydrologyPublicSchema = Type.Object(
  {},
  {
    additionalProperties: false,
    description:
      "Map hydrology projection controls. This stage stamps Hydrology lake intent into Civ7 water state and always records readback evidence.",
  }
);

export default createStage({
  id: "map-hydrology",
  knobsSchema: MapHydrologyKnobsSchema,
  public: MapHydrologyPublicSchema,
  compile: () => ({
    lakes: { projectionReadback: true },
  }),
  steps: orderStandardStageSteps("map-hydrology", { lakes }),
} as const);
