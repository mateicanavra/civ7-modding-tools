import { artifacts as hydrographyArtifacts } from "@mapgen/domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyArtifacts } from "@mapgen/domain/morphology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import { MAP_PROJECTION_EFFECT_TAGS } from "../../../../../tag-contracts.js";
import { artifacts as mapRiversArtifacts } from "../../artifacts/index.js";

const PlotRiversStepConfigSchema = Type.Object(
  {
    endpointDischargePercentileMin: Type.Number({
      minimum: 0,
      maximum: 1,
      description:
        "Minimum discharge percentile admitted as an engine-projectable navigable-river endpoint.",
    }),
    targetMajorTileFraction: Type.Number({
      minimum: 0,
      maximum: 1,
      description:
        "Target share of eligible major-river tiles retained in the engine-projectable subset.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Internal navigable-river projection thresholds compiled from the stage's authored density knob.",
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
      hydrographyArtifacts.hydrography,
      hydrographyArtifacts.lakePlan,
      hydrographyArtifacts.riverNetwork,
      morphologyArtifacts.shelf,
      morphologyArtifacts.topography,
    ],
    provides: [mapRiversArtifacts.projectedNavigableRivers],
  },
  schema: PlotRiversStepConfigSchema,
});
