import { artifacts as hydrographyArtifacts } from "../../../../../../domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyErosionArtifacts } from "../../../../../../domain/morphology/modules/erosion/artifacts/index.js";
import { artifacts as morphologyShelfArtifacts } from "../../../../../../domain/morphology/modules/shelf/artifacts/index.js";
import { artifacts as morphologyCoastsArtifacts } from "../../../../../../domain/morphology/modules/coasts/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";
import { STANDARD_COMPLETIONS } from "../../../../completions.js";

/**
 * Defines the one engine-maintenance transaction after wonder stamping. The
 * step emits placement readiness and preserves boundary snapshots for
 * diagnostics; terminal product parity belongs to the final observation step.
 */
export const config = defineStep({
  id: "prepare-placement-surface",
  engine: [
    "validateAndFixTerrain",
    "getTerrainType",
    "readCurrentMapTerrainTypes",
    "readCurrentMapWaterMask",
    "readCurrentMapLakeMask",
    "readCurrentMapAreaIds",
    "readCurrentMapElevationSnapshot",
    "isWater",
    "setTerrainType",
    "setElevation",
    "generateCliffsFromElevation",
    "storeWaterData",
    "recalculateAreas",
  ] as const,
  requires: [
    STANDARD_COMPLETIONS.naturalWondersPlaced,
    morphologyShelfArtifacts.shelf,
    morphologyErosionArtifacts.topography,
    hydrographyArtifacts.projectedLakes,
    hydrographyArtifacts.hydrography,
    morphologyCoastsArtifacts.resolvedCoastline,
  ],
  provides: [STANDARD_COMPLETIONS.surfacePrepared],
});
