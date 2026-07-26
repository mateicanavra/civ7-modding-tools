import { MorphologySubstrateSchema } from "@mapgen/domain/morphology/model/schemas/index.js";
import {
  type ArtifactValidationContext,
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  defineArtifactValidator,
} from "@swooper/mapgen-core/authoring/contracts";

/** Closed schema for tectonically derived substrate before geomorphic erosion. */
export const Schema = MorphologySubstrateSchema;

/** Registers the base substrate consumed only by geomorphology. */
export const artifact = defineArtifact({
  name: "baseSubstrate",
  id: "artifact:morphology.substrate.base",
  schema: Schema,
});

function validateLocal(
  value: unknown,
  context?: ArtifactValidationContext
): readonly ArtifactValidationIssue[] {
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
}

/** Admits map-sized base substrate fields after Core validates the vintage shape. */
export const validate = defineArtifactValidator(artifact, validateLocal);
