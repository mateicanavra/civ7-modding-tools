import {
  type ArtifactValidationContext,
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  defineArtifactValidator,
  type Static,
} from "@swooper/mapgen-core/authoring/contracts";
import { FeatureOccupancySchema } from "../model/schemas/index.js";

/** Runtime contract for occupancy after floodplain intents have claimed their tiles. */
export const Schema = FeatureOccupancySchema;

export type OccupancyArtifact = Static<typeof Schema>;

/**
 * Registers occupancy after floodplain planning. Ice planning consumes this exact snapshot,
 * making family ordering deterministic and preventing a tile from being claimed twice.
 */
export const artifact = defineArtifact({
  name: "occupancyFloodplains",
  id: "artifact:ecology.occupancy.floodplains",
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
 * Validates post-floodplain occupancy against its closed schema and, when map dimensions are
 * supplied, verifies every tile field matches that width × height. It returns accumulated
 * issues so artifact admission can reject a structurally valid but spatially inconsistent
 * payload.
 */
export const validate = defineArtifactValidator(artifact, validateLocal);
