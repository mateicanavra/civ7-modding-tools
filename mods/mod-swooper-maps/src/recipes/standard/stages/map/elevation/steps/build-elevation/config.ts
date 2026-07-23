import { artifacts as morphologyArtifacts } from "@mapgen/domain/morphology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

import { MAP_PROJECTION_EFFECT_TAGS } from "../../../../../tag-contracts.js";
import { artifacts as mapHydrologyArtifacts } from "../../../hydrology/artifacts/index.js";

/**
 * Defines elevation materialization after mountains, volcanoes, and lakes are projected.
 * It consumes Morphology height truth plus accepted lake evidence; readback remains
 * invocation-local evidence for parity, trace, and visualization.
 */
export const BuildElevationStepContract = defineStep({
  id: "build-elevation",
  engine: [
    "recalculateAreas",
    "buildElevation",
    "getTerrainType",
    "getElevation",
    "isWater",
  ] as const,
  requires: [
    MAP_PROJECTION_EFFECT_TAGS.map.mountainsPlotted,
    MAP_PROJECTION_EFFECT_TAGS.map.volcanoesPlotted,
    MAP_PROJECTION_EFFECT_TAGS.map.lakesPlotted,
  ],
  provides: [MAP_PROJECTION_EFFECT_TAGS.map.elevationBuilt],
  artifacts: {
    requires: [morphologyArtifacts.topography, mapHydrologyArtifacts.engineProjectionLakes],
  },
  schema: Type.Object({}),
});
