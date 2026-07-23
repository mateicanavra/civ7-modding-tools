import {
  type ArtifactValidationContext,
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
} from "@swooper/mapgen-core/authoring/contracts";
import { MorphologyTopographySchema } from "../model/schemas/index.js";

/** Closed schema for eroded topography before island-chain edits. */
const Schema = MorphologyTopographySchema;

/** Registers the eroded topography consumed only by island planning. */
export const artifact = defineArtifact({
  name: "erodedTopography",
  id: "artifact:morphology.topography.eroded",
  schema: Schema,
  refine: validateLocal,
});

/** Admits map-sized eroded topography fields after Core validates the vintage shape. */
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
