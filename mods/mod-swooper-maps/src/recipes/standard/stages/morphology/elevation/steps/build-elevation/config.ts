import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

import { MAP_PROJECTION_EFFECT_TAGS } from "../../../../../tag-contracts.js";

/**
 * Defines elevation materialization after mountains, volcanoes, and lakes are projected.
 * It consumes Morphology height truth while deriving its expected water surface from
 * a fresh engine observation; readback remains invocation-local parity evidence.
 */
export const config = defineStep({
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
    requires: [morphologyLandformsArtifacts.topography],
  },
  schema: Type.Object({}),
});
