import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { artifacts as placementRegionArtifacts } from "@mapgen/domain/placement/modules/regions/artifacts/index.js";
import { artifacts as placementStartArtifacts } from "@mapgen/domain/placement/modules/starts/artifacts/index.js";
import { artifacts as placementWonderArtifacts } from "@mapgen/domain/placement/modules/wonders/artifacts/index.js";
import { artifacts as resourceSiteArtifacts } from "@mapgen/domain/resources/modules/sites/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";
import {
  MAP_PROJECTION_EFFECT_TAGS,
  PLACEMENT_PRODUCT_EFFECT_TAGS,
  STANDARD_ENGINE_EFFECT_TAGS,
} from "../../../../tag-contracts.js";

/**
 * Terminal placement evidence step. DECLARED parity read (ADR-009): this step
 * intentionally reads final Morphology topography and compares its land mask
 * against a current engine readback. That product-vs-engine comparison is
 * projected as metrics, trace evidence, and visualization rather than stored
 * as another immutable domain artifact.
 */
export const config = defineStep({
  id: "placement",
  engine: ["getTerrainType", "getElevation", "isWater"] as const,
  requires: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.advancedStartsAssigned],
  provides: [
    STANDARD_ENGINE_EFFECT_TAGS.engine.placementApplied,
    MAP_PROJECTION_EFFECT_TAGS.map.placementParityCaptured,
  ],
  artifacts: {
    requires: [
      placementWonderArtifacts.naturalWonderPlacement,
      resourceSiteArtifacts.resourcePlacementOutcomes,
      placementStartArtifacts.startAssignment,
      placementRegionArtifacts.landmassRegionSlotByTile,
      morphologyLandformsArtifacts.topography,
    ],
  },
});
