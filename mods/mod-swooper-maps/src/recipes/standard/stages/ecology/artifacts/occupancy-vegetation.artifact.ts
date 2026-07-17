import type { ArtifactValidationContext } from "@swooper/mapgen-core/authoring/contracts";
import {
  defineArtifact,
  type Static,
  Type,
  TypedArraySchemas,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

/** Runtime contract for final occupancy after vegetation intents have claimed their tiles. */
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

/** Canonical schema entrypoint for registering and validating post-vegetation occupancy. */
export const Schema = OccupancyArtifactSchema;

/**
 * Registers occupancy after vegetation planning. It closes the ordered Ecology planning chain
 * and preserves which tiles were claimed or permanently blocked for downstream evidence.
 */
export const artifact = defineArtifact({
  name: "occupancyVegetation",
  id: "artifact:ecology.occupancy.vegetation",
  schema: Schema,
});

export type ArtifactValidationIssue = Readonly<{ message: string }>;

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

function isOccupancyArtifact(value: unknown): value is OccupancyArtifact {
  if (!value || typeof value !== "object") return false;
  const candidate = value as OccupancyArtifact;
  return (
    typeof candidate.width === "number" &&
    typeof candidate.height === "number" &&
    candidate.featureOccupancyMask instanceof Uint8Array &&
    candidate.reserved instanceof Uint8Array
  );
}

function validatePayload(
  value: unknown,
  dimensions: NonNullable<ArtifactValidationContext["dimensions"]>
): ArtifactValidationIssue[] {
  const errors: ArtifactValidationIssue[] = [];
  if (!isOccupancyArtifact(value)) {
    errors.push({ message: "Invalid occupancy artifact payload." });
    return errors;
  }
  const size = expectedSize(dimensions);
  if (value.width !== dimensions.width || value.height !== dimensions.height) {
    errors.push({ message: "Occupancy dimensions mismatch." });
  }
  validateTypedArray(errors, "featureOccupancyMask", value.featureOccupancyMask, Uint8Array, size);
  validateTypedArray(errors, "reserved", value.reserved, Uint8Array, size);
  return errors;
}

/**
 * Validates final Ecology occupancy against its closed schema and, when map dimensions are
 * supplied, verifies every tile field matches that width × height. It returns accumulated
 * issues so artifact admission can reject a structurally valid but spatially inconsistent
 * payload.
 */
export function validate(
  value: unknown,
  context?: ArtifactValidationContext
): readonly { message: string }[] {
  const schemaIssues = validateArtifactSchema(Schema, value);
  if (!context?.dimensions) return schemaIssues;
  return Object.freeze([...schemaIssues, ...validatePayload(value, context.dimensions)]);
}
