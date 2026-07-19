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
 * Defines resource intent from final physics truth and the declared Civ7
 * legality surface; downstream steps may adjust intent but not re-author policy.
 */
export const PlanResourcesStepContract = defineStep({
  id: "plan-resources",
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
