import { BIOME_SYMBOL_ORDER } from "@mapgen/domain/ecology";
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

/**
 * Runtime contract for per-tile Ecology biome classification and its climate/vegetation classifier
 * signals, keeping downstream feature scoring on one field vintage.
 */
export const BiomeClassificationArtifactSchema = Type.Object({
  width: Type.Integer({ minimum: 1 }),
  height: Type.Integer({ minimum: 1 }),
  biomeIndex: TypedArraySchemas.u8({
    description: "Biome symbol index per land tile; 255 marks water or an unclassified tile.",
  }),
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

/** Canonical schema entrypoint used to register and validate biome-classification evidence. */
export const Schema = BiomeClassificationArtifactSchema;

/**
 * Registers Ecology's per-tile biome classification after climate, pedology, and topography
 * classification. Feature scoring and map projection consume this same field vintage so intent
 * and engine binding cannot drift.
 */
export const artifact = defineArtifact({
  name: "biomeClassification",
  id: "artifact:ecology.biomeClassification",
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
    if (context?.dimensions) {
      errors.push({ message: "Invalid biome classification artifact payload." });
    }
    return errors;
  }
  const dimensions = context?.dimensions;
  const size = artifactCellCount(context);
  if (dimensions && (value.width !== dimensions.width || value.height !== dimensions.height)) {
    errors.push({ message: "Biome classification dimensions mismatch." });
  }
  if (
    appendArtifactTypedArrayIssues<Uint8Array>(
      errors,
      "biomeIndex",
      value.biomeIndex,
      Uint8Array,
      size
    )
  ) {
    validateBiomeIndices(errors, value.biomeIndex);
  }
  if (
    appendArtifactTypedArrayIssues<Float32Array>(
      errors,
      "vegetationDensity",
      value.vegetationDensity,
      Float32Array,
      size
    )
  ) {
    validateFiniteValues(errors, "vegetationDensity", value.vegetationDensity, 0, 1);
  }
  if (
    appendArtifactTypedArrayIssues<Float32Array>(
      errors,
      "effectiveMoisture",
      value.effectiveMoisture,
      Float32Array,
      size
    )
  ) {
    validateFiniteValues(errors, "effectiveMoisture", value.effectiveMoisture);
  }
  if (
    appendArtifactTypedArrayIssues<Float32Array>(
      errors,
      "surfaceTemperature",
      value.surfaceTemperature,
      Float32Array,
      size
    )
  ) {
    validateFiniteValues(errors, "surfaceTemperature", value.surfaceTemperature);
  }
  if (
    appendArtifactTypedArrayIssues<Float32Array>(
      errors,
      "aridityIndex",
      value.aridityIndex,
      Float32Array,
      size
    )
  ) {
    validateFiniteValues(errors, "aridityIndex", value.aridityIndex, 0, 1);
  }
  if (
    appendArtifactTypedArrayIssues<Float32Array>(
      errors,
      "freezeIndex",
      value.freezeIndex,
      Float32Array,
      size
    )
  ) {
    validateFiniteValues(errors, "freezeIndex", value.freezeIndex, 0, 1);
  }
  if (
    appendArtifactTypedArrayIssues<Float32Array>(
      errors,
      "groundIce01",
      value.groundIce01,
      Float32Array,
      size
    )
  ) {
    validateFiniteValues(errors, "groundIce01", value.groundIce01, 0, 1);
  }
  if (
    appendArtifactTypedArrayIssues<Float32Array>(
      errors,
      "permafrost01",
      value.permafrost01,
      Float32Array,
      size
    )
  ) {
    validateFiniteValues(errors, "permafrost01", value.permafrost01, 0, 1);
  }
  if (
    appendArtifactTypedArrayIssues<Float32Array>(
      errors,
      "meltPotential01",
      value.meltPotential01,
      Float32Array,
      size
    )
  ) {
    validateFiniteValues(errors, "meltPotential01", value.meltPotential01, 0, 1);
  }
  if (
    appendArtifactTypedArrayIssues<Float32Array>(
      errors,
      "treeLine01",
      value.treeLine01,
      Float32Array,
      size
    )
  ) {
    validateFiniteValues(errors, "treeLine01", value.treeLine01, 0, 1);
  }
  return errors;
}

function validateBiomeIndices(errors: ArtifactValidationIssue[], values: Uint8Array): void {
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index]!;
    if (value !== 255 && value >= BIOME_SYMBOL_ORDER.length) {
      errors.push({
        message: `Expected biomeIndex values to reference the closed biome vocabulary or sentinel 255 (first invalid index ${index}).`,
      });
      return;
    }
  }
}

function validateFiniteValues(
  errors: ArtifactValidationIssue[],
  label: string,
  values: Float32Array,
  minimum?: number,
  maximum?: number
): void {
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index]!;
    if (
      !Number.isFinite(value) ||
      (minimum !== undefined && value < minimum) ||
      (maximum !== undefined && value > maximum)
    ) {
      const range =
        minimum === undefined || maximum === undefined ? "finite" : `${minimum}..${maximum}`;
      errors.push({
        message: `Expected ${label} values to be ${range} (first invalid index ${index}).`,
      });
      return;
    }
  }
}

/**
 * Validates biome classification against its closed schema and, when map dimensions are
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
