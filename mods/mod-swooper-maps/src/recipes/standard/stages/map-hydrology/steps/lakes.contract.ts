import { defineStep, Type } from "@swooper/mapgen-core/authoring";

import { MAP_PROJECTION_EFFECT_TAGS } from "../../../tags.js";
import { hydrologyHydrographyArtifacts } from "../../hydrology-hydrography/artifacts.js";
import { morphologyArtifacts } from "../../morphology/artifacts.js";
import { mapHydrologyArtifacts } from "../artifacts.js";

/**
 * Lake projection step (engine-facing).
 *
 * Hydrology owns lake intent. This map stage only materializes that intent and
 * records readback evidence from the adapter.
 */
const LakesStepConfigSchema = Type.Object(
  {
    projectionReadback: Type.Boolean({
      description: "Whether to emit projection readback diagnostics for the planned lake mask.",
      default: true,
    }),
  },
  {
    additionalProperties: false,
    description:
      "Lakes projection config. Hydrology lake intent is produced upstream; this step only stamps and records readback.",
  }
);

const LakesStepContract = defineStep({
  id: "lakes",
  phase: "hydrology",
  requires: [],
  provides: [
    MAP_PROJECTION_EFFECT_TAGS.map.lakesPlotted,
    MAP_PROJECTION_EFFECT_TAGS.map.hydrologyLakesParityCaptured,
  ],
  artifacts: {
    requires: [hydrologyHydrographyArtifacts.lakePlan, morphologyArtifacts.mountains],
    provides: [
      mapHydrologyArtifacts.engineProjectionLakes,
      mapHydrologyArtifacts.hydrologyLakesEngineTerrainSnapshot,
    ],
  },
  schema: LakesStepConfigSchema,
});

export default LakesStepContract;
