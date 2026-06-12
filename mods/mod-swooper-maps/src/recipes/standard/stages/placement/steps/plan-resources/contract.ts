import { Type, defineStep } from "@swooper/mapgen-core/authoring";
import resources from "@mapgen/domain/resources";

import { PLACEMENT_PRODUCT_EFFECT_TAGS } from "../../../../tags.js";
import { placementArtifacts } from "../../artifacts.js";
import { mapArtifacts } from "../../../../map-artifacts.js";
import { morphologyArtifacts } from "../../../morphology/artifacts.js";
import { hydrologyHydrographyArtifacts } from "../../../hydrology-hydrography/artifacts.js";
import { hydrologyClimateRefineArtifacts } from "../../../hydrology-climate-refine/artifacts.js";
import { ecologyArtifacts } from "../../../ecology/artifacts.js";
import { mapRiversArtifacts } from "../../../map-rivers/artifacts.js";

/**
 * Resource planning (placement-realignment S3): habitat-lane derivation +
 * family demand planning + site selection, all owned by domain/resources
 * (ADR-008). Runs after surface preparation so policy legality is evaluated
 * against the final engine surface. Since S5 the plan is a first-class effect
 * (resourcesPlanned): starts assign against the PLAN, the support pass
 * adjusts it, and only then does place-resources stamp (D3 contract change).
 *
 * Declared engine-surface read (ADR-009): per-tile terrain/biome/feature and
 * water readings feed the policy legality masks. This mirrors exactly what
 * the reconcile-time `canHaveResource` oracle sees; reconstructing this
 * surface from artifacts is S6 scope.
 */
const PlanResourcesStepContract = defineStep({
  id: "plan-resources",
  phase: "placement",
  requires: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.surfacePrepared],
  provides: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.resourcesPlanned],
  artifacts: {
    requires: [
      morphologyArtifacts.topography,
      morphologyArtifacts.coastlineMetrics,
      morphologyArtifacts.landmasses,
      morphologyArtifacts.mountains,
      morphologyArtifacts.beltDrivers,
      hydrologyHydrographyArtifacts.hydrography,
      hydrologyHydrographyArtifacts.lakePlan,
      mapRiversArtifacts.projectedNavigableRivers,
      mapRiversArtifacts.engineProjectionRivers,
      hydrologyClimateRefineArtifacts.climateIndices,
      hydrologyClimateRefineArtifacts.cryosphere,
      ecologyArtifacts.biomeClassification,
      ecologyArtifacts.pedology,
      mapArtifacts.landmassRegionSlotByTile,
    ],
    provides: [
      placementArtifacts.resourceDemandPlan,
      placementArtifacts.resourcePlan,
      placementArtifacts.resourceEligibility,
    ],
  },
  ops: {
    habitat: resources.ops.deriveHabitatFields,
    aquatic: resources.ops.planAquaticResources,
    cultivated: resources.ops.planCultivatedResources,
    terrestrial: resources.ops.planTerrestrialResources,
    geological: resources.ops.planGeologicalResources,
    groups: resources.ops.planResourceGroups,
    selectSites: resources.ops.selectResourceSites,
  },
  schema: Type.Object({}),
});

export default PlanResourcesStepContract;
