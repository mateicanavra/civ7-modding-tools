import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { PotentialDemandParametersSchema } from "../model/atoms/potential-demand.schema.js";

/**
 * Publishes independent atmospheric precipitation, normalized wetness and seasonal demand before
 * hydrography. The native rainfall codec is a projection boundary, not a physical forcing field.
 */
export const artifact = defineArtifact({
  name: "baselineClimateField",
  id: "artifact:hydrology.baselineClimateField",
  schema: Type.Object(
    {
      precipitation: TypedArraySchemas.f32({
        cardinality: "map-grid",
        description:
          "Annual-mean unclipped atmospheric precipitation in empirical rainfall-index-equivalent units per representative interval.",
      }),
      surfaceWetness: TypedArraySchemas.f32({
        cardinality: "map-grid",
        description:
          "Annual mean of independently reduced member surface wetness, normalized to 0..1; not soil water or local plant supply.",
      }),
      rainfallCodec: TypedArraySchemas.u8({
        cardinality: "map-grid",
        description: "Native rainfall codec derived once from annual precipitation by rounding and clamping to 0..200.",
      }),
      potentialDemand: TypedArraySchemas.f32({
        cardinality: "map-grid",
        description:
          "Mean of seasonal empirical PET in rainfall units on all surfaces. Not calibrated open-water evaporation.",
      }),
      demandParameters: PotentialDemandParametersSchema,
    },
    {
      additionalProperties: false,
      description:
        "Immutable baseline atmospheric P/W, native codec, and seasonal potential demand with calibration forwarded unchanged to refinement.",
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
    const invalidDemandIndex = value.potentialDemand.findIndex(
      (sample) => !Number.isFinite(sample) || sample < 0
    );
    if (invalidDemandIndex >= 0) {
      issues.add(
        `Expected climate.potentialDemand[${invalidDemandIndex}] to be finite and nonnegative (received ${value.potentialDemand[invalidDemandIndex]}).`
      );
    }
  },
});
