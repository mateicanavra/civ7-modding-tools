import { Type, defineStep } from "@swooper/mapgen-core/authoring";
import hydrology from "@mapgen/domain/hydrology";

import { MAP_PROJECTION_EFFECT_TAGS } from "../../../tags.js";
import { hydrologyHydrographyArtifacts } from "../../hydrology-hydrography/artifacts.js";
import { mapRiversArtifacts } from "../artifacts.js";

const PlotRiversStepConfigSchema = Type.Object(
  {},
  {
    additionalProperties: false,
    description:
      "Map-rivers step config. Navigable-river selection semantics are owned by the Hydrology op envelope on this step.",
  }
);

const PlotRiversStepContract = defineStep({
  id: "plot-rivers",
  phase: "hydrology",
  requires: [MAP_PROJECTION_EFFECT_TAGS.map.elevationBuilt],
  provides: [
    MAP_PROJECTION_EFFECT_TAGS.map.riversPlotted,
    MAP_PROJECTION_EFFECT_TAGS.map.riversParityCaptured,
  ],
  artifacts: {
    requires: [
      hydrologyHydrographyArtifacts.hydrography,
      hydrologyHydrographyArtifacts.lakePlan,
      hydrologyHydrographyArtifacts.riverNetworkMetrics,
    ],
    provides: [
      mapRiversArtifacts.projectedNavigableRivers,
      mapRiversArtifacts.engineProjectionRivers,
      mapRiversArtifacts.riversEngineTerrainSnapshot,
    ],
  },
  ops: {
    selectNavigableRiverTerrain: hydrology.ops.selectNavigableRiverTerrain,
  },
  schema: PlotRiversStepConfigSchema,
});

export default PlotRiversStepContract;
