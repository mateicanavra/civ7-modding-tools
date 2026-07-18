import resources from "@mapgen/domain/resources";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import { artifacts as standardArtifacts } from "../../../../artifacts/index.js";
import { PLACEMENT_PRODUCT_EFFECT_TAGS } from "../../../../tag-contracts.js";
import { artifacts as ecologyArtifacts } from "../../../ecology/artifacts/index.js";
import { artifacts as hydrologyClimateRefineArtifacts } from "../../../hydrology-climate-refine/artifacts/index.js";
import { artifacts as hydrologyHydrographyArtifacts } from "../../../hydrology-hydrography/artifacts/index.js";
import { artifacts as mapRiversArtifacts } from "../../../map-rivers/artifacts/index.js";
import { artifacts as morphologyArtifacts } from "../../../morphology/artifacts/index.js";
import { artifactModules as placementArtifactModules } from "../../artifacts/index.js";

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
      morphologyArtifacts.shelf,
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
      standardArtifacts.landmassRegionSlotByTile,
    ],
    provides: [
      placementArtifactModules.resourceDemandPlan,
      placementArtifactModules.resourcePlan,
      placementArtifactModules.resourceEligibility,
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
