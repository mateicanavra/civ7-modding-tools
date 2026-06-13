import placement from "@mapgen/domain/placement";
import { defineStep, Type } from "@swooper/mapgen-core/authoring";
import { mapArtifacts } from "../../../../map-artifacts.js";
import { PLACEMENT_PRODUCT_EFFECT_TAGS } from "../../../../tags.js";
import { ecologyArtifacts } from "../../../ecology/artifacts.js";
import { hydrologyHydrographyArtifacts } from "../../../hydrology-hydrography/artifacts.js";
import { morphologyArtifacts } from "../../../morphology/artifacts.js";
import { placementArtifacts } from "../../artifacts.js";

/**
 * S5 (D3 contract change): starts assign against the resource PLAN, not the
 * stamped outcomes — stamping happens after the resource↔start support pass.
 * The resource-support scoring term reads planned site intents.
 */
const AssignStartsStepContract = defineStep({
  id: "assign-starts",
  phase: "placement",
  requires: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.resourcesPlanned],
  provides: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.startsAssigned],
  artifacts: {
    requires: [
      placementArtifacts.placementInputs,
      placementArtifacts.resourcePlan,
      placementArtifacts.naturalWonderPlacement,
      mapArtifacts.landmassRegionSlotByTile,
      morphologyArtifacts.topography,
      morphologyArtifacts.landmasses,
      morphologyArtifacts.mountains,
      morphologyArtifacts.volcanoes,
      morphologyArtifacts.coastlineMetrics,
      hydrologyHydrographyArtifacts.hydrography,
      hydrologyHydrographyArtifacts.lakePlan,
      ecologyArtifacts.biomeClassification,
      ecologyArtifacts.pedology,
    ],
    provides: [placementArtifacts.startAssignment],
  },
  ops: {
    starts: placement.ops.planStarts,
  },
  schema: Type.Object({}, { additionalProperties: false }),
});

export default AssignStartsStepContract;
