import type { ArtifactValidationContext } from "@swooper/mapgen-core/authoring/contracts";
import {
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  type Static,
  Type,
  TypedArraySchemas,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

/** Runtime contract for occupancy after floodplain intents have claimed their tiles. */
export const OccupancyArtifactSchema = Type.Object({
  width: Type.Integer({ minimum: 1 }),
  height: Type.Integer({ minimum: 1 }),
  featureOccupancyMask: TypedArraySchemas.u8({
    description: "0 = unoccupied, nonzero = already claimed by an ecology feature intent",
  }),
  reserved: TypedArraySchemas.u8({
    description: "0 = tile can be claimed, 1 = permanently blocked",
  }),
});

export type OccupancyArtifact = Static<typeof OccupancyArtifactSchema>;

/** Canonical schema entrypoint for registering and validating post-floodplain occupancy. */
export const Schema = OccupancyArtifactSchema;

/**
 * Registers occupancy after floodplain planning. Ice planning consumes this exact snapshot,
 * making family ordering deterministic and preventing a tile from being claimed twice.
 */
export const artifact = defineArtifact({
  name: "occupancyFloodplains",
  id: "artifact:ecology.occupancy.floodplains",
  schema: Schema,
});

export type ArtifactValidationIssue = Readonly<{ message: string }>;

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validatePayload(
  value: unknown,
  context?: ArtifactValidationContext
): ArtifactValidationIssue[] {
  const errors: ArtifactValidationIssue[] = [];
  if (!isRecord(value)) {
    if (context?.dimensions) errors.push({ message: "Invalid occupancy artifact payload." });
    return errors;
  }
  const dimensions = context?.dimensions;
  const size = artifactCellCount(context);
  if (dimensions && (value.width !== dimensions.width || value.height !== dimensions.height)) {
    errors.push({ message: "Occupancy dimensions mismatch." });
  }
  appendArtifactTypedArrayIssues(
    errors,
    "featureOccupancyMask",
    value.featureOccupancyMask,
    Uint8Array,
    size
  );
  appendArtifactTypedArrayIssues(errors, "reserved", value.reserved, Uint8Array, size);
  return errors;
}

/**
 * Validates post-floodplain occupancy against its closed schema and, when map dimensions are
 * supplied, verifies every tile field matches that width × height. It returns accumulated
 * issues so artifact admission can reject a structurally valid but spatially inconsistent
 * payload.
 */
export function validate(
  value: unknown,
  context?: ArtifactValidationContext
): readonly { message: string }[] {
  const schemaIssues = validateArtifactSchema(Schema, value);
  return Object.freeze([...schemaIssues, ...validatePayload(value, context)]);
}
