import { FEATURE_PLACEMENT_KEYS, type PlotEffectKey } from "@mapgen/domain/ecology";
import type { ArtifactValidationContext } from "@swooper/mapgen-core/authoring/contracts";
import {
  defineArtifact,
  type Static,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";
import { validateArtifactSchema } from "@swooper/mapgen-core/authoring/contracts";

export const BiomeClassificationArtifactSchema = Type.Object({
  width: Type.Integer({ minimum: 1 }),
  height: Type.Integer({ minimum: 1 }),
  biomeIndex: TypedArraySchemas.u8({ description: "Biome symbol index per tile." }),
  vegetationDensity: TypedArraySchemas.f32({ description: "Vegetation density per tile (0..1)." }),
  effectiveMoisture: TypedArraySchemas.f32({ description: "Effective moisture per tile." }),
  surfaceTemperature: TypedArraySchemas.f32({ description: "Surface temperature per tile (C)." }),
  aridityIndex: TypedArraySchemas.f32({ description: "Aridity index per tile (0..1)." }),
  freezeIndex: TypedArraySchemas.f32({ description: "Freeze index per tile (0..1)." }),
  groundIce01: TypedArraySchemas.f32({ description: "Ground ice per tile (0..1)." }),
  permafrost01: TypedArraySchemas.f32({ description: "Permafrost per tile (0..1)." }),
  meltPotential01: TypedArraySchemas.f32({ description: "Melt potential per tile (0..1)." }),
  treeLine01: TypedArraySchemas.f32({ description: "Tree line suitability per tile (0..1)." }),
});

export type BiomeClassificationArtifact = Static<typeof BiomeClassificationArtifactSchema>;

export const Schema = BiomeClassificationArtifactSchema;

export const artifact = defineArtifact({
  name: "biomeClassification",
  id: "artifact:ecology.biomeClassification",
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

function isBiomeClassificationArtifact(value: unknown): value is BiomeClassificationArtifact {
  if (!value || typeof value !== "object") return false;
  const candidate = value as BiomeClassificationArtifact;
  return (
    typeof candidate.width === "number" &&
    typeof candidate.height === "number" &&
    candidate.biomeIndex instanceof Uint8Array &&
    candidate.vegetationDensity instanceof Float32Array &&
    candidate.effectiveMoisture instanceof Float32Array &&
    candidate.surfaceTemperature instanceof Float32Array &&
    candidate.aridityIndex instanceof Float32Array &&
    candidate.freezeIndex instanceof Float32Array &&
    candidate.groundIce01 instanceof Float32Array &&
    candidate.permafrost01 instanceof Float32Array &&
    candidate.meltPotential01 instanceof Float32Array &&
    candidate.treeLine01 instanceof Float32Array
  );
}

function validatePayload(
  value: unknown,
  dimensions: NonNullable<ArtifactValidationContext["dimensions"]>
): ArtifactValidationIssue[] {
  const errors: ArtifactValidationIssue[] = [];
  if (!isBiomeClassificationArtifact(value)) {
    errors.push({ message: "Invalid biome classification artifact payload." });
    return errors;
  }
  const size = expectedSize(dimensions);
  if (value.width !== dimensions.width || value.height !== dimensions.height) {
    errors.push({ message: "Biome classification dimensions mismatch." });
  }
  validateTypedArray(errors, "biomeIndex", value.biomeIndex, Uint8Array, size);
  validateTypedArray(errors, "vegetationDensity", value.vegetationDensity, Float32Array, size);
  validateTypedArray(errors, "effectiveMoisture", value.effectiveMoisture, Float32Array, size);
  validateTypedArray(errors, "surfaceTemperature", value.surfaceTemperature, Float32Array, size);
  validateTypedArray(errors, "aridityIndex", value.aridityIndex, Float32Array, size);
  validateTypedArray(errors, "freezeIndex", value.freezeIndex, Float32Array, size);
  validateTypedArray(errors, "groundIce01", value.groundIce01, Float32Array, size);
  validateTypedArray(errors, "permafrost01", value.permafrost01, Float32Array, size);
  validateTypedArray(errors, "meltPotential01", value.meltPotential01, Float32Array, size);
  validateTypedArray(errors, "treeLine01", value.treeLine01, Float32Array, size);
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
