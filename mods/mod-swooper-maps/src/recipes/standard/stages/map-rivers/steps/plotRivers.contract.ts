import hydrology from "@mapgen/domain/hydrology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

import { MAP_PROJECTION_EFFECT_TAGS } from "../../../tag-contracts.js";
import { artifacts as hydrologyHydrographyArtifacts } from "../../hydrology-hydrography/artifacts/index.js";
import { artifacts as mapMorphologyArtifacts } from "../../map-morphology/artifacts/index.js";
import { artifacts as mapRiversArtifacts } from "../artifacts/index.js";

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
      mapMorphologyArtifacts.coastClassification,
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
