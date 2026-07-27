import { artifacts as hydrographyArtifacts } from "@mapgen/domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";
import { MAP_PROJECTION_EFFECT_TAGS } from "../../../../../tag-contracts.js";

/**
 * Defines the engine-facing lake projection boundary over Hydrology intent and
 * Morphology's protected mountain and volcano surfaces. The implementation owns
 * Civ7 mutation and emits readback only through local trace, metrics, and
 * visualization facets.
 */
export const config = defineStep({
  id: "lakes",
  description: "Projects admitted lake intent and records immutable projection evidence.",
  engine: ["stampLakes"] as const,
  requires: [
    hydrographyArtifacts.lakePlan,
    morphologyLandformsArtifacts.mountains,
    morphologyLandformsArtifacts.volcanoes,
  ],
  provides: [
    MAP_PROJECTION_EFFECT_TAGS.map.lakesPlotted,
    MAP_PROJECTION_EFFECT_TAGS.map.hydrologyLakesParityCaptured,
    hydrographyArtifacts.projectedLakes,
  ],
});
