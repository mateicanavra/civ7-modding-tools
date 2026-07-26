import { artifacts as morphologyArtifacts } from "@mapgen/domain/morphology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import {
  MAP_PROJECTION_EFFECT_TAGS,
  PLACEMENT_PRODUCT_EFFECT_TAGS,
} from "../../../../tag-contracts.js";
import { artifacts as mapHydrologyArtifacts } from "../../../map/hydrology/artifacts/index.js";
import {
  artifactModules as placementArtifactModules,
  artifacts as placementArtifacts,
} from "../../artifacts/index.js";

/**
 * Defines the one maintenance transaction after wonder stamping, publishing
 * the engine readback that all later placement products consume.
 */
export const PreparePlacementSurfaceStepContract = defineStep({
  id: "prepare-placement-surface",
  engine: [
    "getAreaId",
    "validateAndFixTerrain",
    "getTerrainType",
    "isWater",
    "isLake",
    "setTerrainType",
    "storeWaterData",
    "recalculateAreas",
    "getLandmassId",
    "setLandmassRegionId",
  ] as const,
  requires: [
    MAP_PROJECTION_EFFECT_TAGS.map.landmassRegionsPlotted,
    PLACEMENT_PRODUCT_EFFECT_TAGS.placement.naturalWondersPlaced,
  ],
  provides: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.surfacePrepared],
  artifacts: {
    requires: [
      mapHydrologyArtifacts.engineProjectionLakes,
      placementArtifacts.landmassRegionSlotByTile,
      morphologyArtifacts.shelf,
      morphologyArtifacts.topography,
    ],
    provides: [
      placementArtifactModules.placementSurfacePreparation,
      placementArtifactModules.placementSurfaceValidationBoundary,
    ],
  },
  schema: Type.Object({}, { additionalProperties: false }),
});
