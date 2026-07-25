import { artifacts as climateArtifacts } from "@mapgen/domain/hydrology/modules/climate/artifacts/index.js";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import { MAP_PROJECTION_EFFECT_TAGS } from "../../../../../tag-contracts.js";

const ProjectRainfallStepConfigSchema = Type.Object(
  {},
  {
    additionalProperties: false,
    description:
      "Rainfall projection has no author-facing configuration; it materializes the admitted final climate surface exactly once.",
  }
);

/**
 * Declares the sole engine projection boundary for Hydrology rainfall. It consumes
 * the final-refined climate artifact and records completion as a map projection effect.
 */
export const config = defineStep({
  id: "project-rainfall",
  engine: ["setRainfall"] as const,
  requires: [],
  provides: [MAP_PROJECTION_EFFECT_TAGS.map.rainfallProjected],
  artifacts: {
    requires: [climateArtifacts.climateField],
    provides: [],
  },
  schema: ProjectRainfallStepConfigSchema,
});
