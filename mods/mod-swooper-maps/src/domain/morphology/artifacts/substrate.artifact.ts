import {
  type ArtifactValidationContext,
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
} from "@swooper/mapgen-core/authoring/contracts";
import { MorphologySubstrateSchema } from "../model/schemas/index.js";

/** Closed schema for the final substrate consumed by landform and Ecology stages. */
const Schema = MorphologySubstrateSchema;

/** Registers the canonical final substrate consumed by downstream stages. */
export const artifact = defineArtifact({
  name: "substrate",
  id: "artifact:morphology.substrate",
  schema: Schema,
  refine: validateLocal,
});

/** Admits map-sized final substrate fields after Core validates the vintage shape. */
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
