import { artifacts as hydrographyArtifacts } from "@mapgen/domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import { MAP_PROJECTION_EFFECT_TAGS } from "../../../../../tag-contracts.js";

/**
 * Lake projection step (engine-facing).
 *
 * Hydrology owns lake intent. This map stage only materializes that intent and
 * records readback evidence from the adapter.
 */
const LakesStepConfigSchema = Type.Object(
  {},
  {
    additionalProperties: false,
    description:
      "Lake projection has no authored step configuration; stamping and readback evidence are unconditional at the engine boundary.",
  }
);

/**
 * Defines the engine-facing lake projection boundary over Hydrology intent and
 * Morphology's protected mountain surface. The implementation owns Civ7 mutation
 * and emits readback only through local trace, metrics, and visualization facets.
 */
export const config = defineStep({
  id: "lakes",
  engine: ["stampLakes"] as const,
  requires: [],
  provides: [
    MAP_PROJECTION_EFFECT_TAGS.map.lakesPlotted,
    MAP_PROJECTION_EFFECT_TAGS.map.hydrologyLakesParityCaptured,
  ],
  artifacts: {
    requires: [hydrographyArtifacts.lakePlan, morphologyLandformsArtifacts.mountains],
    provides: [hydrographyArtifacts.projectedLakes],
  },
  schema: LakesStepConfigSchema,
});
