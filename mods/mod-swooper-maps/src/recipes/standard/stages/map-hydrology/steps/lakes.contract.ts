import { Type, defineStep } from "@swooper/mapgen-core/authoring";

import { M10_EFFECT_TAGS } from "../../../tags.js";
import { mapArtifacts } from "../../../map-artifacts.js";
import { hydrologyHydrographyArtifacts } from "../../hydrology-hydrography/artifacts.js";

/**
 * Lake projection step (engine-facing).
 *
 * Lakes are projected from deterministic hydrology lake plans as a gameplay projection.
 * This step must remain deterministic and must not embed regional “paint” behavior inside Hydrology truth.
 */
const LakesStepConfigSchema = Type.Object({}, { additionalProperties: false });

const LakesStepContract = defineStep({
  id: "lakes",
  phase: "gameplay",
  requires: [],
  provides: [M10_EFFECT_TAGS.map.hydrologyLakesParityCaptured],
  artifacts: {
    requires: [hydrologyHydrographyArtifacts.hydrography, hydrologyHydrographyArtifacts.lakePlan],
    provides: [
      hydrologyHydrographyArtifacts.engineProjectionLakes,
      mapArtifacts.hydrologyLakesEngineTerrainSnapshot,
    ],
  },
  schema: LakesStepConfigSchema,
});

export default LakesStepContract;
