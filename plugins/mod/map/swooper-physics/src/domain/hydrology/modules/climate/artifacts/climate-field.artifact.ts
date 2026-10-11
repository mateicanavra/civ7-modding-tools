import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Publishes copied baseline atmospheric precipitation, wetness and native codec without local
 * water bonuses. Physical consumers use float P/W; only projection consumes the codec.
 */
export const artifact = defineArtifact({
  name: "climateField",
  id: "artifact:hydrology.climateField",
  schema: Type.Object(
    {
      precipitation: TypedArraySchemas.f32({
        cardinality: "map-grid",
        description:
          "Copied baseline atmospheric precipitation in empirical rainfall-index-equivalent units, unclipped by native codec limits.",
      }),
      surfaceWetness: TypedArraySchemas.f32({
        cardinality: "map-grid",
        description:
          "Copied baseline atmospheric surface-wetness proxy, normalized to 0..1 and independent of local plant-water opportunity.",
      }),
      rainfallCodec: TypedArraySchemas.u8({
        cardinality: "map-grid",
        description: "Copied baseline native rainfall codec in Civ7's inclusive 0..200 range; not model forcing.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Immutable final atmospheric P/W and projection-only rainfall codec copied from the baseline.",
    }
  ),
  refine: (value, { issues }) => {
    const invalidIndex = value.rainfallCodec.findIndex((sample) => sample > 200);
    if (invalidIndex >= 0) {
      issues.add(
        `Expected climate.rainfallCodec[${invalidIndex}] to be within 0..200 (received ${value.rainfallCodec[invalidIndex]}).`
      );
    }
    const invalidPrecipitationIndex = value.precipitation.findIndex((sample) => !Number.isFinite(sample) || sample < 0);
    if (invalidPrecipitationIndex >= 0) {
      issues.add(`Expected climate.precipitation[${invalidPrecipitationIndex}] to be finite and nonnegative (received ${value.precipitation[invalidPrecipitationIndex]}).`);
    }
    const invalidWetnessIndex = value.surfaceWetness.findIndex((sample) => !Number.isFinite(sample) || sample < 0 || sample > 1);
    if (invalidWetnessIndex >= 0) {
      issues.add(`Expected climate.surfaceWetness[${invalidWetnessIndex}] to be finite and within 0..1 (received ${value.surfaceWetness[invalidWetnessIndex]}).`);
    }
  },
});
