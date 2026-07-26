import { artifacts as hydrographyArtifacts } from "@mapgen/domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { artifacts as morphologyShelfArtifacts } from "@mapgen/domain/morphology/modules/shelf/artifacts/index.js";
import { artifacts as placementRegionArtifacts } from "@mapgen/domain/placement/modules/regions/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";
import {
  MAP_PROJECTION_EFFECT_TAGS,
  PLACEMENT_PRODUCT_EFFECT_TAGS,
} from "../../../../tag-contracts.js";

/**
 * Defines the one maintenance transaction after wonder stamping. The step emits
 * placement readiness while metrics and visualization project invocation-local readback.
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
    "getLandmassId",
    "setLandmassRegionId",
  ] as const,
  requires: [
    MAP_PROJECTION_EFFECT_TAGS.map.landmassRegionsPlotted,
    PLACEMENT_PRODUCT_EFFECT_TAGS.placement.naturalWondersPlaced,
  ],
  provides: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.surfacePrepared],
  artifacts: {
    requires: [
      hydrographyArtifacts.projectedLakes,
      placementRegionArtifacts.landmassRegionSlotByTile,
      morphologyShelfArtifacts.shelf,
      morphologyLandformsArtifacts.topography,
    ],
  },
});
