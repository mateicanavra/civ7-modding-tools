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

/**
 * Runtime contract for initial feature occupancy and permanent reservations before any family
 * planner claims tiles.
 */
export const Schema = FeatureOccupancySchema;

export type OccupancyArtifact = Static<typeof Schema>;

/**
 * Registers the initial Ecology occupancy snapshot produced with score layers. Zero means
 * claimable, nonzero means claimed, and the blocked mask prevents every later family planner
 * from independently redefining eligibility.
 */
export const artifact = defineArtifact({
  name: "occupancyBase",
  id: "artifact:ecology.occupancy.base",
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
 * Validates base Ecology occupancy against its closed schema and, when map dimensions are
 * supplied, verifies every tile field matches that width × height. It returns accumulated
 * issues so artifact admission can reject a structurally valid but spatially inconsistent
 * payload.
 */
export const validate = defineArtifactValidator(artifact, validateLocal);
