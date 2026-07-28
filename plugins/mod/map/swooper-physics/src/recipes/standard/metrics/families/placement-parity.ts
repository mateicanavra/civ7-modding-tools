import { type Static, Type } from "typebox";

/** Closed terminal measurements comparing Standard map intent with one final engine snapshot. */
export const StandardPlacementParityMeasurementsSchema = Type.Object(
  {
    version: Type.Literal(1, {
      description: "Schema version for the Standard placement-parity measurement record.",
    }),
    waterDriftCount: Type.Integer({
      minimum: 0,
      description:
        "Number of final map tiles whose engine water classification differs from the Standard recipe's modeled land and admitted-lake surface.",
    }),
    acceptedLakeTileCount: Type.Integer({
      minimum: 0,
      description:
        "Number of Hydrology-planned lake tiles admitted for projection and checked in the final engine snapshot.",
    }),
    finalLakeWaterDriftCount: Type.Integer({
      minimum: 0,
      description:
        "Number of admitted lake tiles no longer classified as water in the final engine snapshot.",
    }),
    finalLakeClassificationDriftCount: Type.Integer({
      minimum: 0,
      description:
        "Number of admitted lake tiles no longer classified as lakes in the final engine snapshot.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Standard recipe terminal parity measurements derived from one post-placement engine snapshot.",
  }
);

/** Measurements projected from one completed Standard placement-parity observation. */
export type StandardPlacementParityMeasurements = Static<
  typeof StandardPlacementParityMeasurementsSchema
>;

/** Causal counters derived from one terminal Standard placement snapshot. */
export type StandardPlacementParityMeasurementInput = Omit<
  StandardPlacementParityMeasurements,
  "version"
>;

/**
 * Projects one immutable placement-parity record without retaining mutable
 * engine state.
 */
export function measureStandardPlacementParity(
  input: StandardPlacementParityMeasurementInput
): StandardPlacementParityMeasurements {
  return Object.freeze({
    version: 1,
    waterDriftCount: input.waterDriftCount,
    acceptedLakeTileCount: input.acceptedLakeTileCount,
    finalLakeWaterDriftCount: input.finalLakeWaterDriftCount,
    finalLakeClassificationDriftCount: input.finalLakeClassificationDriftCount,
  });
}
