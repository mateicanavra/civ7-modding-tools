import { artifacts as hydrographyArtifacts } from "@mapgen/domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { artifacts as morphologyShelfArtifacts } from "@mapgen/domain/morphology/modules/shelf/artifacts/index.js";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import { MAP_PROJECTION_EFFECT_TAGS } from "../../../../../tag-contracts.js";
import { NAVIGABLE_RIVER_PROJECTION_POLICY } from "../../model/policy/navigable-river-projection.js";

const PlotRiversStepConfigSchema = Type.Object(
  {
    endpointDischargePercentileMin: Type.Number({
      default: NAVIGABLE_RIVER_PROJECTION_POLICY.normal.endpointDischargePercentileMin,
      minimum: 0,
      maximum: 1,
      description:
        "Advanced minimum discharge percentile admitted as an engine-projectable navigable-river endpoint.",
    }),
    targetMajorTileFraction: Type.Number({
      default: NAVIGABLE_RIVER_PROJECTION_POLICY.normal.targetMajorTileFraction,
      minimum: 0,
      maximum: 1,
      description:
        "Advanced target share of eligible major-river tiles retained in the engine-projectable subset.",
    }),
  },
  {
    additionalProperties: false,
  }
);

/**
 * Defines river projection after elevation exists, requiring Hydrology truth and publishing the
 * immutable navigable-river plan. Mutable Civ7 readback remains invocation-local evidence rather
 * than becoming a later-consumed artifact snapshot.
 */
export const config = defineStep({
  id: "plot-rivers",
  description:
    "Projects admitted river evidence and retains author-facing navigable-river thresholds.",
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
  requires: [
    MAP_PROJECTION_EFFECT_TAGS.map.elevationBuilt,
    hydrographyArtifacts.hydrography,
    hydrographyArtifacts.lakePlan,
    hydrographyArtifacts.riverNetwork,
    morphologyShelfArtifacts.shelf,
    morphologyLandformsArtifacts.topography,
  ],
  provides: [
    MAP_PROJECTION_EFFECT_TAGS.map.riversPlotted,
    hydrographyArtifacts.projectedNavigableRivers,
  ],

  schema: PlotRiversStepConfigSchema,
});
