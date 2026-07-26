import { MorphologyTopographySchema } from "@mapgen/domain/morphology/model/schemas/index.js";
import {
  type ArtifactValidationContext,
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  defineArtifactValidator,
} from "@swooper/mapgen-core/authoring/contracts";

/** Closed schema for the initial landmass topography before coastline carving. */
export const Schema = MorphologyTopographySchema;

/** Registers the base topography consumed only by coastline carving. */
export const artifact = defineArtifact({
  name: "baseTopography",
  id: "artifact:morphology.topography.base",
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

/** Admits map-sized base topography fields after Core validates the vintage shape. */
export const validate = defineArtifactValidator(artifact, validateLocal);
