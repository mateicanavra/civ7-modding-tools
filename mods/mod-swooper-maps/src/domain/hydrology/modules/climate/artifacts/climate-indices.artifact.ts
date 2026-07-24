import {
  type ArtifactValidationContext,
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

type ClimateIndices = Readonly<{
  surfaceTemperatureC: Float32Array;
  effectiveMoisture: Float32Array;
  pet: Float32Array;
  aridityIndex: Float32Array;
  freezeIndex: Float32Array;
}>;

/**
 * Registers refined per-tile temperature, evapotranspiration, aridity, freeze, and related
 * climate indices. Ecology consumes these normalized physical signals instead of deriving
 * parallel climate policy.
 */
export const artifact = defineArtifact({
  name: "climateIndices",
  id: "artifact:hydrology.climateIndices",
  schema: Type.Object(
    {
      surfaceTemperatureC: TypedArraySchemas.f32({
        description:
          "Surface temperature proxy in degrees Celsius used for biome gating and freeze behavior.",
      }),
      effectiveMoisture: TypedArraySchemas.f32({
        description:
          "Moisture available to Ecology after rainfall, humidity, and nearby river influence are combined.",
      }),
      pet: TypedArraySchemas.f32({
        description:
          "Potential evapotranspiration proxy in rainfall units used to distinguish water demand from supply.",
      }),
      aridityIndex: TypedArraySchemas.f32({
        description: "Dryness ratio derived from precipitation and evapotranspiration (0..1).",
      }),
      freezeIndex: TypedArraySchemas.f32({
        description: "Persistence of freezing conditions per tile (0..1).",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Derived Hydrology climate signals consumed by Ecology and product analysis without re-deriving climate policy.",
    }
  ),
  refine: (
    input: unknown,
    context?: ArtifactValidationContext
  ): readonly ArtifactValidationIssue[] => {
    const value = input as ClimateIndices;
    const expectedLength = artifactCellCount(context);
    const errors: ArtifactValidationIssue[] = [];
    appendArtifactTypedArrayIssues(
      errors,
      "climateIndices.surfaceTemperatureC",
      value.surfaceTemperatureC,
      Float32Array,
      expectedLength
    );
    appendArtifactTypedArrayIssues(
      errors,
      "climateIndices.effectiveMoisture",
      value.effectiveMoisture,
      Float32Array,
      expectedLength
    );
    appendArtifactTypedArrayIssues(
      errors,
      "climateIndices.pet",
      value.pet,
      Float32Array,
      expectedLength
    );
    appendArtifactTypedArrayIssues(
      errors,
      "climateIndices.aridityIndex",
      value.aridityIndex,
      Float32Array,
      expectedLength
    );
    appendArtifactTypedArrayIssues(
      errors,
      "climateIndices.freezeIndex",
      value.freezeIndex,
      Float32Array,
      expectedLength
    );
    return errors;
  },
});
