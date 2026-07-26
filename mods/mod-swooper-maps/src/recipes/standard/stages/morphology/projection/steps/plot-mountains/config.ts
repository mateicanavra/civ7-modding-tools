import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";
import { MAP_PROJECTION_EFFECT_TAGS } from "../../../../../tag-contracts.js";

/**
 * Defines mountain projection after continent terrain is stable, requiring Morphology's authored
 * mask and topography while owning no mountain-generation policy.
 */
export const config = defineStep({
  id: "plot-mountains",
  description: "Projects admitted Morphology mountain intent onto the current Civ7 map.",
  engine: ["setTerrainType", "isWater"] as const,
  requires: [MAP_PROJECTION_EFFECT_TAGS.map.continentsPlotted],
  provides: [MAP_PROJECTION_EFFECT_TAGS.map.mountainsPlotted],
  artifacts: {
    requires: [morphologyLandformsArtifacts.mountains, morphologyLandformsArtifacts.topography],
    provides: [],
  },
});
