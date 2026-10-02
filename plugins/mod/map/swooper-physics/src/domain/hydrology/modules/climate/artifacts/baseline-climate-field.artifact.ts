import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { PotentialDemandParametersSchema } from "../model/atoms/potential-demand.schema.js";

/**
 * Publishes the pre-hydrography rainfall, humidity, and demand vintage so river routing and later climate
 * refinement share one causal baseline. Admission preserves map cardinality and Civ7's inclusive
 * `0..200` rainfall domain.
 */
export const artifact = defineArtifact({
  name: "baselineClimateField",
  id: "artifact:hydrology.baselineClimateField",
  schema: Type.Object(
    {
      rainfall: TypedArraySchemas.u8({
        cardinality: "map-grid",
        description:
          "Annual-mean precipitation intensity before river-corridor and cryosphere refinement, encoded in Civ7's inclusive 0-200 rainfall domain.",
      }),
      humidity: TypedArraySchemas.u8({
        cardinality: "map-grid",
        description:
          "Annual-mean atmospheric moisture available to river routing and climate refinement, encoded on an inclusive 0-255 scale.",
      }),
      potentialDemand: TypedArraySchemas.f32({
        cardinality: "map-grid",
        description:
          "Mean of seasonal empirical PET in rainfall units on original Morphology land; zero on original water. Not calibrated open-water evaporation.",
      }),
      demandParameters: PotentialDemandParametersSchema,
    },
    {
      additionalProperties: false,
      description:
        "Hydrology's immutable pre-hydrography rainfall, humidity, and potential demand with the admitted calibration forwarded to refinement.",
    }
  ),
  refine: (value, { issues }) => {
    const invalidIndex = value.rainfall.findIndex((sample) => sample > 200);
    if (invalidIndex >= 0) {
      issues.add(
        `Expected climate.rainfall[${invalidIndex}] to be within 0..200 (received ${value.rainfall[invalidIndex]}).`
      );
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
