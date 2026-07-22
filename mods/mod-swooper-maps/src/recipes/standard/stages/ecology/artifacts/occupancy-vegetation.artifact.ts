import { FeatureOccupancySchema } from "@mapgen/domain/ecology/model/schemas/index.js";
import {
  type ArtifactValidationContext,
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  defineArtifactValidator,
  type Static,
} from "@swooper/mapgen-core/authoring/contracts";

/** Runtime contract for final occupancy after vegetation intents have claimed their tiles. */
export const Schema = FeatureOccupancySchema;

export type OccupancyArtifact = Static<typeof Schema>;

/**
 * Registers occupancy after vegetation planning. It closes the ordered Ecology planning chain
 * and preserves which tiles were claimed or permanently blocked for downstream evidence.
 */
export const artifact = defineArtifact({
  name: "occupancyVegetation",
  id: "artifact:ecology.occupancy.vegetation",
  schema: Schema,
});

function validateLocal(
  input: unknown,
  context?: ArtifactValidationContext
): readonly ArtifactValidationIssue[] {
  const value = input as Static<typeof Schema>;
  const issues: ArtifactValidationIssue[] = [];
  const dimensions = context?.dimensions;
  const size = artifactCellCount(context);
  if (dimensions && (value.width !== dimensions.width || value.height !== dimensions.height)) {
    issues.push({ message: "Occupancy dimensions mismatch." });
  }
  appendArtifactTypedArrayIssues(
    issues,
    "featureOccupancyMask",
    value.featureOccupancyMask,
    Uint8Array,
    size
  );
  appendArtifactTypedArrayIssues(issues, "reserved", value.reserved, Uint8Array, size);
  return issues;
}

/**
 * Validates final Ecology occupancy against its closed schema and, when map dimensions are
 * supplied, verifies every tile field matches that width × height. It returns accumulated
 * issues so artifact admission can reject a structurally valid but spatially inconsistent
 * payload.
 */
export const validate = defineArtifactValidator(artifact, validateLocal);
