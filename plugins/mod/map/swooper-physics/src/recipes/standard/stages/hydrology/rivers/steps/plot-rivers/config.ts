import { artifacts as hydrographyArtifacts } from "../../../../../../../domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "../../../../../../../domain/morphology/modules/landforms/artifacts/index.js";
import { artifacts as morphologyShelfArtifacts } from "../../../../../../../domain/morphology/modules/shelf/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";
import { STANDARD_COMPLETIONS } from "../../../../../completions.js";

/**
 * Defines river projection after elevation exists, requiring Hydrology truth and publishing the
 * immutable authored-river plan. Mutable Civ7 readback remains invocation-local evidence rather
 * than becoming a later-consumed artifact snapshot.
 */
export const config = defineStep({
  id: "plot-rivers",
  description:
    "Projects every admitted physical river source with its authored receiver and native class.",
  engine: [
    "isWater",
    "getTerrainType",
    "setTerrainType",
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
    hydrographyArtifacts.hydrography,
    hydrographyArtifacts.lakePlan,
    hydrographyArtifacts.projectedLakes,
    morphologyShelfArtifacts.shelf,
    morphologyLandformsArtifacts.topography,
  ],
  provides: [STANDARD_COMPLETIONS.riversPlotted, hydrographyArtifacts.projectedRivers],
});
