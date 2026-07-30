import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { artifacts as morphologyShelfArtifacts } from "@mapgen/domain/morphology/modules/shelf/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";
import { PLACEMENT_PRODUCT_EFFECT_TAGS } from "../../../../tag-contracts.js";

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
    "setTerrainType",
    "storeWaterData",
    "recalculateAreas",
  ] as const,
  requires: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.naturalWondersPlaced],
  provides: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.surfacePrepared],
  artifacts: {
    requires: [morphologyShelfArtifacts.shelf, morphologyLandformsArtifacts.topography],
  },
});
