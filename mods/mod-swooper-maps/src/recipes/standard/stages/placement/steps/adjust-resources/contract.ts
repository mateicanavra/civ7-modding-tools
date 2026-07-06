import resources from "@mapgen/domain/resources";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import { mapArtifacts } from "../../../../map-artifacts.js";
import { PLACEMENT_PRODUCT_EFFECT_TAGS } from "../../../../tag-contracts.js";
import { artifacts as morphologyArtifacts } from "../../../morphology/artifacts/index.js";
import { artifacts as placementArtifacts } from "../../artifacts/index.js";

/**
 * Resource↔start support pass (placement-realignment S5, D3 contract change).
 *
 * Runs AFTER start assignment and BEFORE resource stamping:
 * resourcesPlanned → startsAssigned → resourcesAdjusted → resourcesPlaced.
 * The domain op produces a bounded move/add adjustment of the resource plan
 * so every start meets the support floor (E3.1) and cross-player support
 * stays within the equity tolerance (E3.2), with typed provenance and typed
 * shortfalls. place-resources stamps the ADJUSTED intents.
 */
const AdjustResourcesStepContract = defineStep({
  id: "adjust-resources",
  phase: "placement",
  requires: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.startsAssigned],
  provides: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.resourcesAdjusted],
  artifacts: {
    requires: [
      placementArtifacts.resourcePlan,
      placementArtifacts.resourceEligibility,
      placementArtifacts.startAssignment,
      mapArtifacts.landmassRegionSlotByTile,
      morphologyArtifacts.landmasses,
    ],
    provides: [placementArtifacts.resourcePlanAdjusted],
  },
  ops: {
    support: resources.ops.adjustResourceSupport,
  },
  schema: Type.Object({}),
});

export default AdjustResourcesStepContract;
