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

/**
 * Defines river projection after elevation exists, requiring Hydrology truth and declaring the
 * planned plus engine-readback artifacts used for parity. The implementation owns navigable-river
 * selection and Civ7 mutation.
 */
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
