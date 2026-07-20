import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

import { MAP_PROJECTION_EFFECT_TAGS } from "../../../../tag-contracts.js";
import { artifacts as mapHydrologyArtifacts } from "../../../map-hydrology/artifacts/index.js";
import { artifacts as morphologyArtifacts } from "../../../morphology/artifacts/index.js";
import { artifactModules as mapElevationArtifactModules } from "../../artifacts/index.js";

/**
 * Defines elevation materialization after mountains, volcanoes, and lakes are projected. It
 * consumes Morphology height truth plus accepted lake evidence, then publishes engine readback
 * for parity diagnostics.
 */
export const BuildElevationStepContract = defineStep({
  id: "build-elevation",
  requires: [
    MAP_PROJECTION_EFFECT_TAGS.map.mountainsPlotted,
    MAP_PROJECTION_EFFECT_TAGS.map.volcanoesPlotted,
    MAP_PROJECTION_EFFECT_TAGS.map.lakesPlotted,
  ],
  provides: [
    MAP_PROJECTION_EFFECT_TAGS.map.elevationBuilt,
    MAP_PROJECTION_EFFECT_TAGS.map.elevationParityCaptured,
  ],
  artifacts: {
    requires: [morphologyArtifacts.topography, mapHydrologyArtifacts.engineProjectionLakes],
    provides: [mapElevationArtifactModules.elevationEngineTerrainSnapshot],
  },
  schema: Type.Object({}),
});
