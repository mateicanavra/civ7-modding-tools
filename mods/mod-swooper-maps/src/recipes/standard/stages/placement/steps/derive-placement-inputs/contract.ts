import { Type, defineStep } from "@swooper/mapgen-core/authoring";
import placement from "@mapgen/domain/placement";

import { M4_EFFECT_TAGS } from "../../../../tags.js";
import { placementArtifacts } from "../../artifacts.js";
import { hydrologyHydrographyArtifacts } from "../../../hydrology-hydrography/artifacts.js";
import { ecologyArtifacts } from "../../../ecology/artifacts.js";
import { morphologyArtifacts } from "../../../morphology/artifacts.js";

/**
 * Builds the placement input artifact from runtime config and placement ops.
 */
const DerivePlacementInputsContract = defineStep({
  id: "derive-placement-inputs",
  phase: "placement",
  requires: [
    M4_EFFECT_TAGS.engine.riversModeled,
    M4_EFFECT_TAGS.engine.featuresApplied,
  ],
  provides: [],
  artifacts: {
    requires: [
      morphologyArtifacts.topography,
      hydrologyHydrographyArtifacts.hydrography,
      hydrologyHydrographyArtifacts.engineProjectionLakes,
      ecologyArtifacts.biomeClassification,
      ecologyArtifacts.pedology,
    ],
    provides: [
      placementArtifacts.placementInputs,
      placementArtifacts.resourcePlan,
      placementArtifacts.naturalWonderPlan,
      placementArtifacts.discoveryPlan,
    ],
  },
  ops: {
    wonders: placement.ops.planWonders,
    naturalWonders: placement.ops.planNaturalWonders,
    discoveries: placement.ops.planDiscoveries,
    floodplains: placement.ops.planFloodplains,
    resources: placement.ops.planResources,
    starts: placement.ops.planStarts,
  },
  schema: Type.Object({}),
});

export default DerivePlacementInputsContract;
