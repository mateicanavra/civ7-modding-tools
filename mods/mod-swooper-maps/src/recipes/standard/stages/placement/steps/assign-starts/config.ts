import { artifacts as ecologyArtifacts } from "@mapgen/domain/ecology";
import { artifacts as hydrologyArtifacts } from "@mapgen/domain/hydrology";
import { artifacts as morphologyArtifacts } from "@mapgen/domain/morphology";
import placement from "@mapgen/domain/placement";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import { PLACEMENT_PRODUCT_EFFECT_TAGS } from "../../../../tag-contracts.js";
import {
  artifactModules as placementArtifactModules,
  artifacts as placementArtifacts,
} from "../../artifacts/index.js";

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
      morphologyArtifacts.topography,
      morphologyArtifacts.landmasses,
      morphologyArtifacts.mountains,
      morphologyArtifacts.volcanoes,
      morphologyArtifacts.shelf,
      hydrologyArtifacts.climateIndices,
      hydrologyArtifacts.hydrography,
      hydrologyArtifacts.lakePlan,
      ecologyArtifacts.pedology,
    ],
    provides: [placementArtifactModules.startAssignment],
  },
  ops: {
    starts: placement.ops.planStarts,
  },
  schema: Type.Object({}, { additionalProperties: false }),
});
