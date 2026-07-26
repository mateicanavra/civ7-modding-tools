import {
  type ArtifactValidationContext,
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  Type,
} from "@swooper/mapgen-core/authoring/contracts";
import { ErodibilityFieldSchema, SedimentDepthFieldSchema } from "../../../model/atoms/index.js";

/** Registers the canonical final substrate consumed by downstream stages. */
export const artifact = defineArtifact({
  name: "substrate",
  id: "artifact:morphology.substrate",
  schema: Type.Object(
    {
      erodibilityK: ErodibilityFieldSchema,
      sedimentDepth: SedimentDepthFieldSchema,
    },
    {
      additionalProperties: false,
      description: "Final Morphology substrate consumed by landform and Ecology stages.",
    }
  ),
  refine: (
    value: unknown,
    context?: ArtifactValidationContext
  ): readonly ArtifactValidationIssue[] => {
    const candidate = value as Record<string, unknown>;
    const size = artifactCellCount(context);
    const issues: ArtifactValidationIssue[] = [];
    appendArtifactTypedArrayIssues(
      issues,
      "substrate.erodibilityK",
      candidate.erodibilityK,
      Float32Array,
      size
    );
    appendArtifactTypedArrayIssues(
      issues,
      "substrate.sedimentDepth",
      candidate.sedimentDepth,
      Float32Array,
      size
    );
    return issues;
  },
});
