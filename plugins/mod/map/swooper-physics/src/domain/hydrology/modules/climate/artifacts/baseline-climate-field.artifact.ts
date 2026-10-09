import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { PotentialDemandParametersSchema } from "../model/atoms/potential-demand.schema.js";

/**
 * Publishes pre-network float forcing and phase-reduced demand. The native rainfall codec is a
 * derived projection, never the supply read by runoff or finite-water accounting.
 */
export const artifact = defineArtifact({
  name: "baselineClimateField",
  id: "artifact:hydrology.baselineClimateField",
  schema: Type.Object(
    {
      precipitation: TypedArraySchemas.f32({
        cardinality: "map-grid",
        description:
          "Calendar-weighted model precipitation per unit tile area over H=1 in rainfall-index-equivalent units; finite and nonnegative, without a byte saturation cap.",
      }),
      surfaceWetness: TypedArraySchemas.f32({
        cardinality: "map-grid",
        description:
          "Calendar-weighted mean of independently weather-reduced clamp01(member precipitation/200), in 0..1; an empirical surface proxy, not air humidity.",
      }),
      rainfallCodec: TypedArraySchemas.u8({
        cardinality: "map-grid",
        description:
          "Derived native rainfall byte: round(clamp(annual precipitation,0,200)); rounding and clipping do not alter physical model supply.",
      }),
      potentialDemand: TypedArraySchemas.f32({
        cardinality: "map-grid",
        description:
          "Calendar-weighted phase potential demand in the same H=1 rainfall-index-equivalent interval as precipitation, computed after weather wetness reduction from each phase's temperature; all surfaces, not actual ET or calibrated open-water evaporation.",
      }),
      demandParameters: PotentialDemandParametersSchema,
    },
    {
      additionalProperties: false,
      description:
        "Hydrology's immutable pre-network float supply, empirical wetness, native codec and phase-mean demand with calibration forwarded unchanged to refinement.",
    }
  ),
  refine: (value, { issues }) => {
    const invalidIndex = value.precipitation.findIndex(
      (sample) => !Number.isFinite(sample) || sample < 0
    );
    if (invalidIndex >= 0) {
      issues.add(
        `Expected baselineClimateField.precipitation[${invalidIndex}] to be finite and nonnegative.`
      );
    }
    const invalidWetnessIndex = value.surfaceWetness.findIndex(
      (sample) => !Number.isFinite(sample) || sample < 0 || sample > 1
    );
    if (invalidWetnessIndex >= 0) {
      issues.add(`Expected baselineClimateField.surfaceWetness[${invalidWetnessIndex}] within 0..1.`);
    }
    const invalidCodecIndex = value.rainfallCodec.findIndex(
      (sample, index) => sample !== Math.min(200, Math.round(value.precipitation[index]!))
    );
    if (invalidCodecIndex >= 0) {
      issues.add(`Expected baselineClimateField.rainfallCodec[${invalidCodecIndex}] to encode precipitation.`);
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
