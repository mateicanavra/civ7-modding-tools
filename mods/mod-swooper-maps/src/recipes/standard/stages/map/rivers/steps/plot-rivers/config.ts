import hydrology, { artifacts as hydrologyArtifacts } from "@mapgen/domain/hydrology";
import { artifacts as morphologyArtifacts } from "@mapgen/domain/morphology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import { MAP_PROJECTION_EFFECT_TAGS } from "../../../../../tag-contracts.js";
import { artifacts as mapRiversArtifacts } from "../../artifacts/index.js";

const PlotRiversStepConfigSchema = Type.Object(
  {},
  {
    additionalProperties: false,
    description:
      "Map-rivers step config. Navigable-river selection semantics are owned by the Hydrology op envelope on this step.",
  }
);

/**
 * Defines river projection after elevation exists, requiring Hydrology truth and publishing the
 * immutable navigable-river plan. Mutable Civ7 readback remains invocation-local evidence rather
 * than becoming a later-consumed artifact snapshot.
 */
export const PlotRiversStepContract = defineStep({
  id: "plot-rivers",
  engine: [
    "isWater",
    "getTerrainType",
    "setTerrainType",
    "modelRivers",
    "validateAndFixTerrain",
    "storeWaterData",
    "defineNamedRivers",
    "recalculateAreas",
    "readRiverProjection",
  ] as const,
  requires: [MAP_PROJECTION_EFFECT_TAGS.map.elevationBuilt],
  provides: [MAP_PROJECTION_EFFECT_TAGS.map.riversPlotted],
  artifacts: {
    requires: [
      hydrologyArtifacts.hydrography,
      hydrologyArtifacts.lakePlan,
      hydrologyArtifacts.riverNetwork,
      morphologyArtifacts.shelf,
      morphologyArtifacts.topography,
    ],
    provides: [mapRiversArtifacts.projectedNavigableRivers],
  },
  ops: {
    selectNavigableRiverTerrain: hydrology.ops.selectNavigableRiverTerrain,
  },
  schema: PlotRiversStepConfigSchema,
});
