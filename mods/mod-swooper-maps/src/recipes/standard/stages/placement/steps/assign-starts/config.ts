import { artifacts as pedologyArtifacts } from "@mapgen/domain/ecology/modules/pedology/artifacts/index.js";
import { artifacts as climateArtifacts } from "@mapgen/domain/hydrology/modules/climate/artifacts/index.js";
import { artifacts as hydrographyArtifacts } from "@mapgen/domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { artifacts as morphologyShelfArtifacts } from "@mapgen/domain/morphology/modules/shelf/artifacts/index.js";
import placement from "@mapgen/domain/placement";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import { PLACEMENT_PRODUCT_EFFECT_TAGS } from "../../../../tag-contracts.js";
import { artifacts as placementArtifacts } from "../../artifacts/index.js";

/**
 * S5 (D3 contract change): starts assign against the resource PLAN, not the
 * stamped outcomes — stamping happens after the resource↔start support pass.
 * The resource-support scoring term reads planned site intents.
 */
export const AssignStartsStepContract = defineStep({
  id: "assign-starts",
  engine: ["getAliveMajorIds", "setStartPosition"] as const,
  requires: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.resourcesPlanned],
  provides: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.startsAssigned],
  artifacts: {
    requires: [
      placementArtifacts.placementInputs,
      placementArtifacts.resourcePlan,
      placementArtifacts.naturalWonderPlacement,
      placementArtifacts.landmassRegionSlotByTile,
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
    provides: [placementArtifacts.startAssignment],
  },
  ops: {
    starts: placement.ops.planStarts,
  },
  schema: Type.Object({}, { additionalProperties: false }),
});
