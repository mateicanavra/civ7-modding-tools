import {
  type ArtifactValidationContext,
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  defineArtifactValidator,
} from "@swooper/mapgen-core/authoring/contracts";
import { MorphologyTopographySchema } from "../model/schemas/index.js";

/** Closed schema for coastline-carved topography used by routing and erosion. */
export const Schema = MorphologyTopographySchema;

/** Registers the carved topography consumed by routing and geomorphology. */
export const artifact = defineArtifact({
  name: "carvedTopography",
  id: "artifact:morphology.topography.carved",
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

/** Admits map-sized carved topography fields after Core validates the vintage shape. */
export const validate = defineArtifactValidator(artifact, validateLocal);
