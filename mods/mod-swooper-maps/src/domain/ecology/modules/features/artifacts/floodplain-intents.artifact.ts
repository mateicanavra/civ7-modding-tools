import {
  type ArtifactValidationIssue,
  appendArtifactGridCoordinateIssues,
  defineArtifact,
  Type,
} from "@swooper/mapgen-core/authoring/contracts";
import { FloodplainFeaturePlacementSchema } from "../model/atoms/index.js";

/**
 * Registers deterministic floodplain intents selected from Ecology feature suitability. Map
 * projection consumes these rows later, keeping feature choice separate from Civ7 acceptance.
 */
export const artifact = defineArtifact({
  name: "floodplainIntents",
  id: "artifact:ecology.floodplainIntents",
  schema: Type.Array(FloodplainFeaturePlacementSchema, {
    description: "Ordered floodplain feature intents admitted before Civ7 projection.",
  }),
  refine: (input, context): readonly ArtifactValidationIssue[] => {
    const issues: ArtifactValidationIssue[] = [];
    appendArtifactGridCoordinateIssues(
      issues,
      "floodplainIntents",
      input as readonly Readonly<{ x: number; y: number }>[],
      context?.dimensions
    );
    return issues;
  },
});
