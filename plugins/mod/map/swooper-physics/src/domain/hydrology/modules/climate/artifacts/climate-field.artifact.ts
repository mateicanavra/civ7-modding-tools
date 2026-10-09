import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Publishes the post-network consumer bundle without changing baseline atmospheric supply.
 * Ecology observes float forcing; native projection alone consumes the derived rainfall codec.
 */
export const artifact = defineArtifact({
  name: "climateField",
  id: "artifact:hydrology.climateField",
  schema: Type.Object(
    {
      precipitation: TypedArraySchemas.f32({
        cardinality: "map-grid",
        description:
          "Unchanged baseline model precipitation in rainfall-index-equivalent units over H=1, finite and nonnegative; resolved lakes and rivers do not create new atmospheric supply.",
      }),
      surfaceWetness: TypedArraySchemas.f32({
        cardinality: "map-grid",
        description:
          "Unchanged baseline empirical surface wetness in 0..1; local riparian moisture belongs only to climateIndices.effectiveMoisture.",
      }),
      rainfallCodec: TypedArraySchemas.u8({
        cardinality: "map-grid",
        description: "Unchanged derived native rainfall byte: round(clamp(precipitation,0,200)).",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Hydrology's immutable post-network forcing bundle; physical supply and its native codec retain the pre-network atmospheric vintage.",
    }
  ),
  refine: (value, { issues }) => {
    const invalidIndex = value.precipitation.findIndex(
      (sample) => !Number.isFinite(sample) || sample < 0
    );
    if (invalidIndex >= 0) {
      issues.add(
        `Expected climateField.precipitation[${invalidIndex}] to be finite and nonnegative.`
      );
    }
    const invalidWetnessIndex = value.surfaceWetness.findIndex(
      (sample) => !Number.isFinite(sample) || sample < 0 || sample > 1
    );
    if (invalidWetnessIndex >= 0) {
      issues.add(`Expected climateField.surfaceWetness[${invalidWetnessIndex}] within 0..1.`);
    }
    const invalidCodecIndex = value.rainfallCodec.findIndex(
      (sample, index) => sample !== Math.min(200, Math.round(value.precipitation[index]!))
    );
    if (invalidCodecIndex >= 0) {
      issues.add(`Expected climateField.rainfallCodec[${invalidCodecIndex}] to encode precipitation.`);
    }
  },
});
