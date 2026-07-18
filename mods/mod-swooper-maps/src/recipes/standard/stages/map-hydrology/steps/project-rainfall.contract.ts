import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import { MAP_PROJECTION_EFFECT_TAGS } from "../../../tag-contracts.js";
import { artifacts as hydrologyClimateRefineArtifacts } from "../../hydrology-climate-refine/artifacts/index.js";

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
const ProjectRainfallStepContract = defineStep({
  id: "project-rainfall",
  phase: "hydrology",
  requires: [],
  provides: [MAP_PROJECTION_EFFECT_TAGS.map.rainfallProjected],
  artifacts: {
    requires: [hydrologyClimateRefineArtifacts.climateField],
    provides: [],
  },
  schema: ProjectRainfallStepConfigSchema,
});

export default ProjectRainfallStepContract;
