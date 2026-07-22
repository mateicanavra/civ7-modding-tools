import { MorphologyTopographySchema } from "@mapgen/domain/morphology/model/schemas/index.js";
import {
  type ArtifactValidationContext,
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  defineArtifactValidator,
} from "@swooper/mapgen-core/authoring/contracts";

/** Closed schema for the final topography consumed throughout the remaining recipe. */
export const Schema = MorphologyTopographySchema;

/** Registers the canonical final topography consumed by downstream stages. */
export const artifact = defineArtifact({
  name: "topography",
  id: "artifact:morphology.topography",
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
    "topography.elevation",
    candidate.elevation,
    Int16Array,
    size
  );
  appendArtifactTypedArrayIssues(
    issues,
    "topography.landMask",
    candidate.landMask,
    Uint8Array,
    size
  );
  appendArtifactTypedArrayIssues(
    issues,
    "topography.bathymetry",
    candidate.bathymetry,
    Int16Array,
    size
  );
  return issues;
}

/** Admits map-sized final topography fields after Core validates the vintage shape. */
export const validate = defineArtifactValidator(artifact, validateLocal);
