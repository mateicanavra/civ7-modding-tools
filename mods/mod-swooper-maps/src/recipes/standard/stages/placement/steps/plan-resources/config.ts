import { artifacts as biomeArtifacts } from "@mapgen/domain/ecology/modules/biomes/artifacts/index.js";
import { artifacts as pedologyArtifacts } from "@mapgen/domain/ecology/modules/pedology/artifacts/index.js";
import { artifacts as hydrologyArtifacts } from "@mapgen/domain/hydrology";
import { artifacts as morphologyArtifacts } from "@mapgen/domain/morphology";
import resources from "@mapgen/domain/resources";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import { PLACEMENT_PRODUCT_EFFECT_TAGS } from "../../../../tag-contracts.js";
import { artifacts as mapRiversArtifacts } from "../../../map/rivers/artifacts/index.js";
import { artifacts as placementArtifacts } from "../../artifacts/index.js";

/**
 * Defines resource intent from final physics truth and the declared Civ7
 * legality surface; downstream steps may adjust intent but not re-author policy.
 */
export const PlanResourcesStepContract = defineStep({
  id: "plan-resources",
  engine: ["readCurrentMapSurface", "isResourceRequiredForAge"] as const,
  requires: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.surfacePrepared],
  provides: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.resourcesPlanned],
  artifacts: {
    requires: [
      morphologyArtifacts.topography,
      morphologyArtifacts.shelf,
      morphologyArtifacts.landmasses,
      morphologyArtifacts.mountains,
      morphologyArtifacts.beltDrivers,
      hydrologyArtifacts.hydrography,
      hydrologyArtifacts.lakePlan,
      mapRiversArtifacts.projectedNavigableRivers,
      hydrologyArtifacts.climateIndices,
      hydrologyArtifacts.cryosphere,
      biomeArtifacts.biomeClassification,
      pedologyArtifacts.pedology,
      placementArtifacts.landmassRegionSlotByTile,
    ],
    provides: [
      placementArtifacts.resourceDemandPlan,
      placementArtifacts.resourcePlan,
      placementArtifacts.resourceEligibility,
    ],
  },
  ops: {
    habitat: resources.habitat.ops.deriveHabitatFields,
    aquatic: resources.demand.ops.planAquaticResources,
    cultivated: resources.demand.ops.planCultivatedResources,
    terrestrial: resources.demand.ops.planTerrestrialResources,
    geological: resources.demand.ops.planGeologicalResources,
    groups: resources.demand.ops.planResourceGroups,
    selectSites: resources.sites.ops.selectResourceSites,
  },
  schema: Type.Object({}),
});
