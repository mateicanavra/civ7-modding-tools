import { artifacts as biomeArtifacts } from "@mapgen/domain/ecology/modules/biomes/artifacts/index.js";
import { artifacts as pedologyArtifacts } from "@mapgen/domain/ecology/modules/pedology/artifacts/index.js";
import { artifacts as climateArtifacts } from "@mapgen/domain/hydrology/modules/climate/artifacts/index.js";
import { artifacts as cryosphereArtifacts } from "@mapgen/domain/hydrology/modules/cryosphere/artifacts/index.js";
import { artifacts as hydrographyArtifacts } from "@mapgen/domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { artifacts as morphologyShelfArtifacts } from "@mapgen/domain/morphology/modules/shelf/artifacts/index.js";
import { artifacts as morphologyTerrainArtifacts } from "@mapgen/domain/morphology/modules/terrain/artifacts/index.js";
import { artifacts as placementRegionArtifacts } from "@mapgen/domain/placement/modules/regions/artifacts/index.js";
import resources from "@mapgen/domain/resources";
import { artifacts as resourceDemandArtifacts } from "@mapgen/domain/resources/modules/demand/artifacts/index.js";
import { artifacts as resourceSiteArtifacts } from "@mapgen/domain/resources/modules/sites/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";
import { PLACEMENT_PRODUCT_EFFECT_TAGS } from "../../../../tag-contracts.js";

/**
 * Defines resource intent from final physics truth and the declared Civ7
 * legality surface; downstream steps may adjust intent but not re-author policy.
 */
export const config = defineStep({
  id: "plan-resources",
  engine: [
    "readCurrentRiverSurface",
    "readCurrentMapBiomeTypes",
    "readCurrentMapFeatureTypes",
    "readCurrentMapWaterMask",
    "isResourceRequiredForAge",
  ] as const,
  requires: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.surfacePrepared],
  provides: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.resourcesPlanned],
  artifacts: {
    requires: [
      morphologyLandformsArtifacts.topography,
      morphologyShelfArtifacts.shelf,
      morphologyLandformsArtifacts.landmasses,
      morphologyLandformsArtifacts.mountains,
      morphologyTerrainArtifacts.beltDrivers,
      hydrographyArtifacts.hydrography,
      hydrographyArtifacts.lakePlan,
      hydrographyArtifacts.projectedNavigableRivers,
      climateArtifacts.climateIndices,
      cryosphereArtifacts.cryosphere,
      biomeArtifacts.biomeClassification,
      pedologyArtifacts.pedology,
      placementRegionArtifacts.landmassRegionSlotByTile,
    ],
    provides: [
      resourceDemandArtifacts.resourceDemandPlan,
      resourceSiteArtifacts.resourcePlan,
      resourceDemandArtifacts.resourceEligibility,
    ],
  },
  ops: {
    habitat: resources.habitat.ops.deriveHabitatFields,
    aquatic: resources.demand.ops.planAquaticResources,
    cultivated: resources.demand.ops.planCultivatedResources,
    terrestrial: resources.demand.ops.planTerrestrialResources,
    geological: resources.demand.ops.planGeologicalResources,
    groups: resources.demand.ops.planResourceGroups,
    demands: resources.demand.ops.resolveResourceDemands,
    selectSites: resources.sites.ops.selectResourceSites,
  },
});
