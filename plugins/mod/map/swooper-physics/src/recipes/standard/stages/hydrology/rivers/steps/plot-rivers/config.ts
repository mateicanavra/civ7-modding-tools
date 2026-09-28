import { artifacts as hydrographyArtifacts } from "../../../../../../../domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "../../../../../../../domain/morphology/modules/landforms/artifacts/index.js";
import { artifacts as morphologyShelfArtifacts } from "../../../../../../../domain/morphology/modules/shelf/artifacts/index.js";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import { STANDARD_COMPLETIONS } from "../../../../../completions.js";
import { NAVIGABLE_RIVER_PROJECTION_POLICY } from "../../model/policy/navigable-river-projection.js";

const PlotRiversStepConfigSchema = Type.Object({ projection: Type.Union([Type.Object(
  {
    model: Type.Literal("legacy-procedural"),
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
), Type.Object({ model: Type.Literal("authored-network") }, { additionalProperties: false })], { default: { model: "legacy-procedural", ...NAVIGABLE_RIVER_PROJECTION_POLICY.normal } }) }, { additionalProperties: false });

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
    "getRiverCapabilities",
    "setRiverInfo",
    "finalizeRivers",
    "validateAndFixTerrain",
    "storeWaterData",
    "recalculateAreas",
    "readRiverProjection",
    "readCurrentMapWaterMask",
    "readCurrentMapTerrainTypes",
    "generateCliffsFromElevation",
  ] as const,
  requires: [
    STANDARD_COMPLETIONS.elevationBuilt,
    STANDARD_COMPLETIONS.rainfallProjected,
    hydrographyArtifacts.hydrography,
    hydrographyArtifacts.lakePlan,
    hydrographyArtifacts.projectedLakes,
    hydrographyArtifacts.riverNetwork,
    morphologyShelfArtifacts.shelf,
    morphologyLandformsArtifacts.topography,
  ],
  provides: [STANDARD_COMPLETIONS.riversPlotted, hydrographyArtifacts.projectedRivers],

  schema: PlotRiversStepConfigSchema,
});
