import {
  type ArtifactValidationIssue,
  defineArtifact,
  Type,
} from "@swooper/mapgen-core/authoring/contracts";
import { FeaturePlacementSchema } from "../model/atoms/index.js";

/**
 * Registers deterministic vegetation-family intents selected from Ecology habitat scores and
 * occupancy truth. Map projection consumes these rows later, keeping ecotype choice separate
 * from Civ7 acceptance.
 */
export const artifact = defineArtifact({
  name: "featureIntentsVegetation",
  id: "artifact:ecology.featureIntents.vegetation",
  schema: Type.Array(FeaturePlacementSchema, {
    description: "Ordered vegetation feature intents admitted before Civ7 projection.",
  }),
  refine: (input, context): readonly ArtifactValidationIssue[] => {
    const dimensions = context?.dimensions;
    if (!dimensions) return [];

    const issues: ArtifactValidationIssue[] = [];
    for (const [index, placement] of (
      input as readonly Readonly<{ x: number; y: number }>[]
    ).entries()) {
      if (placement.x >= dimensions.width || placement.y >= dimensions.height) {
        issues.push({
          message: `featureIntentsVegetation[${index}] coordinate ${placement.x},${placement.y} is outside ${dimensions.width}x${dimensions.height}.`,
        });
      }
    }
    return issues;
  },
});
