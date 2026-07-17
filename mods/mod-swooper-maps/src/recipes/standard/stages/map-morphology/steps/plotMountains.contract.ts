import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

import { MAP_PROJECTION_EFFECT_TAGS } from "../../../tag-contracts.js";
import { artifacts as morphologyArtifacts } from "../../morphology/artifacts/index.js";

/**
 * Defines mountain projection after continent terrain is stable, requiring Morphology's authored
 * mask and topography while owning no mountain-generation policy.
 */
const PlotMountainsStepContract = defineStep({
  id: "plot-mountains",
  phase: "morphology",
  requires: [MAP_PROJECTION_EFFECT_TAGS.map.continentsPlotted],
  provides: [MAP_PROJECTION_EFFECT_TAGS.map.mountainsPlotted],
  artifacts: {
    requires: [morphologyArtifacts.mountains, morphologyArtifacts.topography],
    provides: [],
  },
  schema: Type.Object(
    {},
    {
      additionalProperties: false,
      description:
        "Gameplay mountain projection config. Mountain intent is produced by Morphology.",
    }
  ),
});

export default PlotMountainsStepContract;
