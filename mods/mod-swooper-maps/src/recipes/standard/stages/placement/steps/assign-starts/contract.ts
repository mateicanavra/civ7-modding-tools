import { Type, defineStep } from "@swooper/mapgen-core/authoring";

import placement from "@mapgen/domain/placement";
import { PLACEMENT_PRODUCT_EFFECT_TAGS } from "../../../../tags.js";
import { mapArtifacts } from "../../../../map-artifacts.js";
import { morphologyArtifacts } from "../../../morphology/artifacts.js";
import { hydrologyHydrographyArtifacts } from "../../../hydrology-hydrography/artifacts.js";
import { ecologyArtifacts } from "../../../ecology/artifacts.js";
import { placementArtifacts } from "../../artifacts.js";

const AssignStartsStepContract = defineStep({
  id: "assign-starts",
  phase: "placement",
  requires: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.resourcesPlaced],
  provides: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.startsAssigned],
  artifacts: {
    requires: [
      placementArtifacts.placementInputs,
      placementArtifacts.placementSurfacePreparation,
      placementArtifacts.resourcePlacementOutcomes,
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
