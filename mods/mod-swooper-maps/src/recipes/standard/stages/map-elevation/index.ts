import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import { buildElevation } from "./steps/index.js";

const MapElevationKnobsSchema = Type.Object(
  {},
  {
    additionalProperties: false,
    description:
      "Map elevation knobs. Elevation materialization currently has no author-facing stage knobs.",
  }
);

const MapElevationPublicSchema = Type.Object(
  {},
  {
    additionalProperties: false,
    description:
      "Map elevation projection controls. This stage asks Civ7 to rebuild elevation after static water projection and before river modeling.",
  }
);

/**
 * Engine elevation materialization stage.
 *
 * Civ7 shapes cliffs/shore relief from the terrain surface already in the
 * engine. This stage intentionally runs after static water projection so
 * buildElevation sees lakes as water, and before river modeling because the
 * engine river pass depends on finalized elevation.
 */
export default createStage({
  id: "map-elevation",
  knobsSchema: MapElevationKnobsSchema,
  public: MapElevationPublicSchema,
  compile: () => ({
    "build-elevation": {},
  }),
  steps: orderStandardStageSteps("map-elevation", {
    "build-elevation": buildElevation,
  }),
} as const);
