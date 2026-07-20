import type { ArtifactValidationContext } from "@swooper/mapgen-core/authoring/contracts";
import {
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  Type,
  TypedArraySchemas,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

/**
 * Indices derived from climate signals intended for downstream consumption (Ecology/Narrative/Placement).
 *
 * These are advisory indices: consumers should treat them as derived products and not re-derive ad hoc indices from
 * raw rainfall/temperature unless they own the semantics and have tests locking the contract.
 */
export const HydrologyClimateIndicesSchema = Type.Object(
  {
    /** Surface temperature proxy (C); used for biome gating, freeze logic, and “cold/warm” narrative bias. */
    surfaceTemperatureC: TypedArraySchemas.f32({ description: "Surface temperature proxy (C)." }),
    /**
     * Effective moisture advisory index in "moisture units" (similar scale to rainfall/humidity u8 signals).
     *
     * Semantics are intentionally stable for Ecology consumers:
     * `effectiveMoisture = rainfall + 0.35 * humidity + riparianBonus` where riparianBonus is 0/4/8 for
     * none/minor/major rivers within radius 1.
     */
    effectiveMoisture: TypedArraySchemas.f32({
      description:
        "Effective moisture advisory index (rainfall + 0.35 * humidity + riparian bonus; radius=1; minor=4, major=8).",
    }),
    /** Potential evapotranspiration proxy (rainfall units); advisory signal used for aridity. */
    pet: TypedArraySchemas.f32({
      description: "Potential evapotranspiration proxy (rainfall units).",
    }),
    /** Aridity index (0..1) derived from P vs PET; higher values indicate drier climates. */
    aridityIndex: TypedArraySchemas.f32({
      description: "Aridity index (0..1) derived from P vs PET.",
    }),
    /** Freeze persistence index (0..1); higher values indicate more persistent freezing conditions. */
    freezeIndex: TypedArraySchemas.f32({ description: "Freeze persistence index (0..1)." }),
  },
  {
    description: "Hydrology climate indices derived from rainfall/temperature and related proxies.",
  }
);

/** Canonical schema entrypoint for refined climate indices shared with downstream domains. */
export const Schema = HydrologyClimateIndicesSchema;

/**
 * Registers refined per-tile temperature, evapotranspiration, aridity, freeze, and related
 * climate indices. Ecology consumes these normalized physical signals instead of deriving
 * parallel climate policy.
 */
export const artifact = defineArtifact({
  name: "climateIndices",
  id: "artifact:hydrology.climateIndices",
  schema: Schema,
});

type ArtifactValidationIssue = Readonly<{ message: string }>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validatePayload(value: unknown, expectedLength?: number): ArtifactValidationIssue[] {
  const errors: ArtifactValidationIssue[] = [];
  if (!isRecord(value)) return [{ message: "Missing hydrology climate indices artifact payload." }];
  const candidate = value as {
    surfaceTemperatureC?: unknown;
    effectiveMoisture?: unknown;
    pet?: unknown;
    aridityIndex?: unknown;
    freezeIndex?: unknown;
  };
  appendArtifactTypedArrayIssues(
    errors,
    "climateIndices.surfaceTemperatureC",
    candidate.surfaceTemperatureC,
    Float32Array,
    expectedLength
  );
  appendArtifactTypedArrayIssues(
    errors,
    "climateIndices.effectiveMoisture",
    candidate.effectiveMoisture,
    Float32Array,
    expectedLength
  );
  appendArtifactTypedArrayIssues(
    errors,
    "climateIndices.pet",
    candidate.pet,
    Float32Array,
    expectedLength
  );
  appendArtifactTypedArrayIssues(
    errors,
    "climateIndices.aridityIndex",
    candidate.aridityIndex,
    Float32Array,
    expectedLength
  );
  appendArtifactTypedArrayIssues(
    errors,
    "climateIndices.freezeIndex",
    candidate.freezeIndex,
    Float32Array,
    expectedLength
  );
  return errors;
}

/**
 * Validates climate indices against its closed schema and, when map dimensions are supplied,
 * verifies every tile field matches that width × height. It returns accumulated issues so
 * artifact admission can reject a structurally valid but spatially inconsistent payload.
 */
export function validate(
  value: unknown,
  context?: ArtifactValidationContext
): readonly { message: string }[] {
  return Object.freeze([
    ...validateArtifactSchema(Schema, value),
    ...validatePayload(value, artifactCellCount(context)),
  ]);
}
