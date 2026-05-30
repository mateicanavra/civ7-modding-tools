import { Type, defineStep } from "@swooper/mapgen-core/authoring";

import { STANDARD_ENGINE_EFFECT_TAGS, MAP_PROJECTION_EFFECT_TAGS } from "../../../tags.js";
import { hydrologyHydrographyArtifacts } from "../../hydrology-hydrography/artifacts.js";
import { mapRiversArtifacts } from "../artifacts.js";

const PlotRiversStepConfigSchema = Type.Object(
  {
    /**
     * Engine river modeling minimum length threshold (lower = denser).
     */
    minLength: Type.Integer({
      description: "Engine river modeling minimum length threshold (lower = denser).",
      default: 5,
      minimum: 1,
      maximum: 40,
    }),
    /**
     * Engine river modeling maximum length threshold.
     */
    maxLength: Type.Integer({
      description: "Engine river modeling maximum length threshold.",
      default: 15,
      minimum: 1,
      maximum: 80,
    }),
  },
  {
    additionalProperties: false,
    description: "Config for engine river projection (projection-only).",
  }
);

const PlotRiversStepContract = defineStep({
  id: "plot-rivers",
  phase: "gameplay",
  requires: [MAP_PROJECTION_EFFECT_TAGS.map.elevationBuilt],
  provides: [
    STANDARD_ENGINE_EFFECT_TAGS.engine.riversModeled,
    MAP_PROJECTION_EFFECT_TAGS.map.riversParityCaptured,
  ],
  artifacts: {
    requires: [hydrologyHydrographyArtifacts.hydrography],
    provides: [
      mapRiversArtifacts.engineProjectionRivers,
      mapRiversArtifacts.riversEngineTerrainSnapshot,
    ],
  },
  schema: PlotRiversStepConfigSchema,
});

export default PlotRiversStepContract;
