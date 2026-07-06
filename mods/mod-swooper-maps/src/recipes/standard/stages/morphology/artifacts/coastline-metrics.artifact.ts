import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import type { ArtifactValidationContext } from "@swooper/mapgen-core/authoring/contracts";
import { validateArtifactSchema } from "@swooper/mapgen-core/authoring/contracts";

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

export const Schema = MorphologyCoastlineMetricsArtifactSchema;

export const artifact = defineArtifact({
  name: "coastlineMetrics",
  id: "artifact:morphology.coastlineMetrics",
  schema: Schema,
});

type ArtifactValidationIssue = Readonly<{ message: string }>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function expectedSize(dimensions: NonNullable<ArtifactValidationContext["dimensions"]>): number {
  return Math.max(0, (dimensions.width | 0) * (dimensions.height | 0));
}

function validateTypedArray(
  errors: ArtifactValidationIssue[],
  label: string,
  value: unknown,
  ctor: { new (...args: any[]): { length: number } },
  expectedLength?: number
): value is { length: number } {
  if (!(value instanceof ctor)) {
    errors.push({ message: `Expected ${label} to be ${ctor.name}.` });
    return false;
  }
  if (expectedLength != null && value.length !== expectedLength) {
    errors.push({
      message: `Expected ${label} length ${expectedLength} (received ${value.length}).`,
    });
  }
  return true;
}

function validatePayload(
  value: unknown,
  dimensions: NonNullable<ArtifactValidationContext["dimensions"]>
): ArtifactValidationIssue[] {
  const errors: ArtifactValidationIssue[] = [];
  if (!isRecord(value)) {
    errors.push({ message: "Missing coastline metrics." });
    return errors;
  }
  const size = expectedSize(dimensions);
  const candidate = value as {
    coastalLand?: unknown;
    coastalWater?: unknown;
    distanceToCoast?: unknown;
  };
  validateTypedArray(
    errors,
    "coastlineMetrics.coastalLand",
    candidate.coastalLand,
    Uint8Array,
    size
  );
  validateTypedArray(
    errors,
    "coastlineMetrics.coastalWater",
    candidate.coastalWater,
    Uint8Array,
    size
  );
  validateTypedArray(
    errors,
    "coastlineMetrics.distanceToCoast",
    candidate.distanceToCoast,
    Uint16Array,
    size
  );
  return errors;
}

export function validate(
  value: unknown,
  context?: ArtifactValidationContext
): readonly { message: string }[] {
  const schemaIssues = validateArtifactSchema(Schema, value);
  if (!context?.dimensions) return schemaIssues;
  return Object.freeze([...schemaIssues, ...validatePayload(value, context.dimensions)]);
}
