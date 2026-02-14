import { Type, defineStep } from "@swooper/mapgen-core/authoring";

import { M10_EFFECT_TAGS } from "../../../tags.js";
import { mapArtifacts } from "../../../map-artifacts.js";
import { morphologyArtifacts } from "../../morphology/artifacts.js";
import { hydrologyHydrographyArtifacts } from "../../hydrology-hydrography/artifacts.js";

/**
 * Lake projection step (engine-facing).
 *
 * Lakes are projected via engine mechanisms as a Gameplay projection only.
 * This step must remain deterministic and must not embed regional “paint” behavior inside Hydrology truth.
 */
const LakesStepConfigSchema = Type.Object(
  {
    /**
     * Multiplier applied to engine lake frequency.
     *
     * Practical guidance:
     * - If you want more lakes: decrease this value (e.g. 0.75).
     * - If you want fewer lakes: increase this value (e.g. 1.5).
     */
    tilesPerLakeMultiplier: Type.Number({
      description: "Multiplier applied to the engine lake frequency (higher = fewer lakes; lower = more lakes).",
      default: 1,
      minimum: 0.25,
      maximum: 4,
    }),
  },
  {
    additionalProperties: false,
    description:
      "Lakes step config. Controls lake frequency projection only; does not change Hydrology discharge routing truth.",
  }
);

const LakesStepContract = defineStep({
  id: "lakes",
  phase: "gameplay",
  requires: [],
  provides: [M10_EFFECT_TAGS.map.hydrologyLakesParityCaptured],
  artifacts: {
    requires: [morphologyArtifacts.topography, hydrologyHydrographyArtifacts.hydrography],
    provides: [
      hydrologyHydrographyArtifacts.engineProjectionLakes,
      mapArtifacts.hydrologyLakesEngineTerrainSnapshot,
    ],
  },
  schema: LakesStepConfigSchema,
});

export default LakesStepContract;
