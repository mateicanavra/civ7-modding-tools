import { Type, defineStep } from "@swooper/mapgen-core/authoring";

import { MAP_PROJECTION_EFFECT_TAGS } from "../../../tags.js";
import { hydrologyHydrographyArtifacts } from "../../hydrology-hydrography/artifacts.js";
import { mapRiversArtifacts } from "../artifacts.js";

const PlotRiversStepConfigSchema = Type.Object(
  {
    /**
     * Minimum navigable channel trunk length selected from Hydrology flow.
     */
    minLength: Type.Integer({
      description: "Minimum navigable channel trunk length selected from Hydrology flow.",
      default: 5,
      minimum: 1,
      maximum: 40,
    }),
    /**
     * Maximum navigable channel trunk length selected from Hydrology flow.
     */
    maxLength: Type.Integer({
      description: "Maximum navigable channel trunk length selected from Hydrology flow.",
      default: 15,
      minimum: 1,
      maximum: 80,
    }),
  },
  {
    additionalProperties: false,
    description: "Config for MapGen-owned navigable river projection.",
  }
);

const PlotRiversStepContract = defineStep({
  id: "plot-rivers",
  phase: "gameplay",
  requires: [MAP_PROJECTION_EFFECT_TAGS.map.elevationBuilt],
  provides: [
    MAP_PROJECTION_EFFECT_TAGS.map.riversPlotted,
    MAP_PROJECTION_EFFECT_TAGS.map.riversParityCaptured,
  ],
  artifacts: {
    requires: [hydrologyHydrographyArtifacts.hydrography],
    provides: [
      mapRiversArtifacts.projectedNavigableRivers,
      mapRiversArtifacts.engineProjectionRivers,
      mapRiversArtifacts.riversEngineTerrainSnapshot,
    ],
  },
  schema: PlotRiversStepConfigSchema,
});

export default PlotRiversStepContract;
