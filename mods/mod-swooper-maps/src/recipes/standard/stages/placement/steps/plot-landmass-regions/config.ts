import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import placement from "@mapgen/domain/placement";
import { artifacts as placementRegionArtifacts } from "@mapgen/domain/placement/modules/regions/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";
import { PLACEMENT_PRODUCT_EFFECT_TAGS } from "../../../../tag-contracts.js";

/**
 * Defines the single landmass-region projection after engine-surface
 * maintenance, publishing the per-tile slot evidence consumed by placement.
 */
export const config = defineStep({
  id: "plot-landmass-regions",
  engine: ["getLandmassId", "setLandmassRegionId"] as const,
  requires: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.surfacePrepared],
  provides: [],
  artifacts: {
    requires: [morphologyLandformsArtifacts.topography, morphologyLandformsArtifacts.landmasses],
    provides: [placementRegionArtifacts.landmassRegionSlotByTile],
  },
  ops: {
    regions: placement.regions.ops.projectLandmassRegions,
  },
});
