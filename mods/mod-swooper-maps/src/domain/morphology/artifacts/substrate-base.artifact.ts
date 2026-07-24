import {
  type ArtifactValidationContext,
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  Type,
} from "@swooper/mapgen-core/authoring/contracts";
import { ErodibilityFieldSchema, SedimentDepthFieldSchema } from "../model/atoms/index.js";

/** Registers the base substrate consumed only by geomorphology. */
export const artifact = defineArtifact({
  name: "baseSubstrate",
  id: "artifact:morphology.substrate.base",
  schema: Type.Object(
    {
      erodibilityK: ErodibilityFieldSchema,
      sedimentDepth: SedimentDepthFieldSchema,
    },
    {
      additionalProperties: false,
      description: "Tectonically derived substrate before geomorphic erosion.",
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
