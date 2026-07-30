import { artifacts as biomeArtifacts } from "@mapgen/domain/ecology/modules/biomes/artifacts/index.js";
import { artifacts as pedologyArtifacts } from "@mapgen/domain/ecology/modules/pedology/artifacts/index.js";
import { artifacts as climateArtifacts } from "@mapgen/domain/hydrology/modules/climate/artifacts/index.js";
import { artifacts as cryosphereArtifacts } from "@mapgen/domain/hydrology/modules/cryosphere/artifacts/index.js";
import { artifacts as hydrographyArtifacts } from "@mapgen/domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { artifacts as morphologyShelfArtifacts } from "@mapgen/domain/morphology/modules/shelf/artifacts/index.js";
import { artifacts as morphologyTerrainArtifacts } from "@mapgen/domain/morphology/modules/terrain/artifacts/index.js";
import resources from "@mapgen/domain/resources";
import { artifacts as resourceDemandArtifacts } from "@mapgen/domain/resources/modules/demand/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";
import { STANDARD_INITIAL_SETUP } from "../../../../initial-setup.js";
import { PLACEMENT_PRODUCT_EFFECT_TAGS } from "../../../../tag-contracts.js";

/**
 * Defines complete resource demand from final physics truth and the current Civ7 legality surface.
 * Site selection consumes the published ledger without re-authoring demand policy.
 */
export const config = defineStep({
  id: "plan-resource-demands",
  initialSetup: STANDARD_INITIAL_SETUP,
  engine: [
    "readCurrentRiverSurface",
    "readCurrentMapBiomeTypes",
    "readCurrentMapFeatureTypes",
    "readCurrentMapWaterMask",
    "isResourceRequiredForAge",
  ] as const,
  requires: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.surfacePrepared],
  provides: [],
  artifacts: {
    requires: [
      morphologyLandformsArtifacts.topography,
      morphologyShelfArtifacts.shelf,
      morphologyLandformsArtifacts.mountains,
      morphologyTerrainArtifacts.beltDrivers,
      hydrographyArtifacts.hydrography,
      hydrographyArtifacts.lakePlan,
      hydrographyArtifacts.projectedNavigableRivers,
      climateArtifacts.climateIndices,
      cryosphereArtifacts.cryosphere,
      biomeArtifacts.biomeClassification,
      pedologyArtifacts.pedology,
    ],
    provides: [resourceDemandArtifacts.resourceDemandPlan],
  },
  ops: {
    habitat: resources.habitat.ops.deriveHabitatFields,
    demands: resources.demand.ops.resolveResourceDemands,
  },
});
