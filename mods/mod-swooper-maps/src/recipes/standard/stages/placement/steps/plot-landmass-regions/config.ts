import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import placement from "@mapgen/domain/placement";
import { artifacts as placementRegionArtifacts } from "@mapgen/domain/placement/modules/regions/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";
import { MAP_PROJECTION_EFFECT_TAGS } from "../../../../tag-contracts.js";

/**
 * Defines the pre-placement landmass-region projection from Morphology truth, declaring the
 * per-tile slot map and metadata used to interpret the engine-facing surface.
 */
export const config = defineStep({
  id: "plot-landmass-regions",
  engine: ["getLandmassId", "setLandmassRegionId"] as const,
  requires: [],
  provides: [MAP_PROJECTION_EFFECT_TAGS.map.landmassRegionsPlotted],
  artifacts: {
    requires: [morphologyLandformsArtifacts.topography, morphologyLandformsArtifacts.landmasses],
    provides: [placementRegionArtifacts.landmassRegionSlotByTile],
  },
  ops: {
    regions: placement.regions.ops.projectLandmassRegions,
  },
});
