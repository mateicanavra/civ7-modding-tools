import type { ArtifactValidationContext } from "@swooper/mapgen-core/authoring/contracts";
import {
  defineArtifact,
  type Static,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";
import { validateArtifactSchema } from "@swooper/mapgen-core/authoring/contracts";

export const PedologyArtifactSchema = Type.Object({
  width: Type.Integer({ minimum: 1 }),
  height: Type.Integer({ minimum: 1 }),
  soilType: TypedArraySchemas.u8({ description: "Soil type index per tile." }),
  fertility: TypedArraySchemas.f32({ description: "Fertility per tile (0..1)." }),
});

export type PedologyArtifact = Static<typeof PedologyArtifactSchema>;

export const Schema = PedologyArtifactSchema;

export const artifact = defineArtifact({
  name: "pedology",
  id: "artifact:ecology.soils",
  schema: Schema,
});

export type ArtifactValidationIssue = Readonly<{ message: string }>;

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

function isPedologyArtifact(value: unknown): value is PedologyArtifact {
  if (!value || typeof value !== "object") return false;
  const candidate = value as PedologyArtifact;
  return (
    typeof candidate.width === "number" &&
    typeof candidate.height === "number" &&
    candidate.soilType instanceof Uint8Array &&
    candidate.fertility instanceof Float32Array
  );
}

function validatePayload(
  value: unknown,
  dimensions: NonNullable<ArtifactValidationContext["dimensions"]>
): ArtifactValidationIssue[] {
  const errors: ArtifactValidationIssue[] = [];
  if (!isPedologyArtifact(value)) {
    errors.push({ message: "Invalid pedology artifact payload." });
    return errors;
  }
  const size = expectedSize(dimensions);
  if (value.width !== dimensions.width || value.height !== dimensions.height) {
    errors.push({ message: "Pedology dimensions mismatch." });
  }
  validateTypedArray(errors, "soilType", value.soilType, Uint8Array, size);
  validateTypedArray(errors, "fertility", value.fertility, Float32Array, size);
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
