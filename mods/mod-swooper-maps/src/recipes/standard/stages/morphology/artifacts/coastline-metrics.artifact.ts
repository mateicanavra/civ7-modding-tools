import type { ArtifactValidationContext } from "@swooper/mapgen-core/authoring/contracts";
import {
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  Type,
  TypedArraySchemas,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

const MorphologyCoastlineMetricsArtifactSchema = Type.Object(
  {
    coastalLand: TypedArraySchemas.u8({ description: "Mask (1/0): land tiles adjacent to water." }),
    coastalWater: TypedArraySchemas.u8({
      description: "Mask (1/0): water tiles adjacent to land.",
    }),
    distanceToCoast: TypedArraySchemas.u16({
      description:
        "Minimum tile-graph distance to any coastline tile (0=coast), using wrapX=true and wrapY=false.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "CARVED coastline metrics snapshot (stage morphology-coasts; pre-island). The shelf and the post-island coastline live in artifact:morphology.shelf.",
  }
);

/** Runtime schema for the pre-island carved coastline snapshot. */
export const Schema = MorphologyCoastlineMetricsArtifactSchema;

/**
 * Registers the pre-island carved coastline snapshot used by downstream
 * terrain shaping; post-island coastline truth belongs to the shelf artifact.
 */
export const artifact = defineArtifact({
  name: "coastlineMetrics",
  id: "artifact:morphology.coastlineMetrics",
  schema: Schema,
});

type ArtifactValidationIssue = Readonly<{ message: string }>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validatePayload(
  value: unknown,
  context?: ArtifactValidationContext
): ArtifactValidationIssue[] {
  const errors: ArtifactValidationIssue[] = [];
  if (!isRecord(value)) {
    if (context?.dimensions) {
      errors.push({ message: "Missing coastline metrics." });
    }
    return errors;
  }
  const size = artifactCellCount(context);
  const candidate = value as {
    coastalLand?: unknown;
    coastalWater?: unknown;
    distanceToCoast?: unknown;
  };
  appendArtifactTypedArrayIssues(
    errors,
    "coastlineMetrics.coastalLand",
    candidate.coastalLand,
    Uint8Array,
    size
  );
  appendArtifactTypedArrayIssues(
    errors,
    "coastlineMetrics.coastalWater",
    candidate.coastalWater,
    Uint8Array,
    size
  );
  appendArtifactTypedArrayIssues(
    errors,
    "coastlineMetrics.distanceToCoast",
    candidate.distanceToCoast,
    Uint16Array,
    size
  );
  return errors;
}

/** Validates mask/distance array kinds and their map-sized cardinality when known. */
export function validate(
  value: unknown,
  context?: ArtifactValidationContext
): readonly { message: string }[] {
  const schemaIssues = validateArtifactSchema(Schema, value);
  return Object.freeze([...schemaIssues, ...validatePayload(value, context)]);
}
