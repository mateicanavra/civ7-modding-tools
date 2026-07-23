import { artifacts as ecologyArtifacts } from "@mapgen/domain/ecology";
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
      ecologyArtifacts.biomeClassification,
      ecologyArtifacts.pedology,
      placementArtifacts.landmassRegionSlotByTile,
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
