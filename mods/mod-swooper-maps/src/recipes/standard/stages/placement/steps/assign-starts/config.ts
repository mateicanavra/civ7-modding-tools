import { artifacts as pedologyArtifacts } from "@mapgen/domain/ecology/modules/pedology/artifacts/index.js";
import { artifacts as climateArtifacts } from "@mapgen/domain/hydrology/modules/climate/artifacts/index.js";
import { artifacts as hydrographyArtifacts } from "@mapgen/domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { artifacts as morphologyShelfArtifacts } from "@mapgen/domain/morphology/modules/shelf/artifacts/index.js";
import placement from "@mapgen/domain/placement";
import { artifacts as placementRegionArtifacts } from "@mapgen/domain/placement/modules/regions/artifacts/index.js";
import { artifacts as placementStartArtifacts } from "@mapgen/domain/placement/modules/starts/artifacts/index.js";
import { artifacts as placementWonderArtifacts } from "@mapgen/domain/placement/modules/wonders/artifacts/index.js";
import { artifacts as resourceSiteArtifacts } from "@mapgen/domain/resources/modules/sites/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";
import { PLACEMENT_PRODUCT_EFFECT_TAGS } from "../../../../tag-contracts.js";

/**
 * S5 (D3 contract change): starts assign against the resource PLAN, not the
 * stamped outcomes — stamping happens after the resource↔start support pass.
 * The resource-support scoring term reads planned site intents.
 */
export const config = defineStep({
  id: "assign-starts",
  engine: [
    "emitRuntimeWarning",
    "getMapSizeId",
    "lookupMapInfo",
    "getAliveMajorIds",
    "setStartPosition",
  ] as const,
  requires: [],
  provides: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.startsAssigned],
  artifacts: {
    requires: [
      resourceSiteArtifacts.resourcePlan,
      placementWonderArtifacts.naturalWonderPlacement,
      placementRegionArtifacts.landmassRegionSlotByTile,
      morphologyLandformsArtifacts.topography,
      morphologyLandformsArtifacts.landmasses,
      morphologyLandformsArtifacts.mountains,
      morphologyLandformsArtifacts.volcanoes,
      morphologyShelfArtifacts.shelf,
      climateArtifacts.climateIndices,
      hydrographyArtifacts.hydrography,
      hydrographyArtifacts.lakePlan,
      pedologyArtifacts.pedology,
    ],
    provides: [placementStartArtifacts.startAssignment],
  },
  ops: {
    starts: placement.starts.ops.planStarts,
  },
});
