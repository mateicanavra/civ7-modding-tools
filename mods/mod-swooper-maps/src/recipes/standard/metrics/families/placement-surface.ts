import { type Static, Type } from "typebox";

/** Closed measurements emitted after the Standard placement surface is finalized. */
export const StandardPlacementSurfaceMeasurementsSchema = Type.Object(
  {
    version: Type.Literal(1, {
      description: "Schema version for the Standard placement-surface measurement record.",
    }),
    acceptedLakeTileCount: Type.Integer({
      minimum: 0,
      description:
        "Number of projected and accepted Hydrology-planned lake tiles checked after placement surface maintenance.",
    }),
    finalLakeWaterDriftCount: Type.Integer({
      minimum: 0,
      description:
        "Number of checked lake tiles no longer classified as water after placement maintenance.",
    }),
    finalLakeClassificationDriftCount: Type.Integer({
      minimum: 0,
      description:
        "Number of checked lake tiles no longer classified as lakes after placement maintenance.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Standard recipe measurements of lake stability at the placement-surface boundary.",
  }
);

/** Measurements projected from one completed Standard placement-surface preparation step. */
export type StandardPlacementSurfaceMeasurements = Static<
  typeof StandardPlacementSurfaceMeasurementsSchema
>;

/** Causal evidence needed to measure one completed placement-surface preparation. */
export type StandardPlacementSurfaceMeasurementInput = Omit<
  StandardPlacementSurfaceMeasurements,
  "version"
>;

/**
 * Projects neutral placement-surface measurements without retaining mutable
 * engine state.
 */
export function measureStandardPlacementSurface(
  input: StandardPlacementSurfaceMeasurementInput
): StandardPlacementSurfaceMeasurements {
  return Object.freeze({
    version: 1,
    acceptedLakeTileCount: input.acceptedLakeTileCount,
    finalLakeWaterDriftCount: input.finalLakeWaterDriftCount,
    finalLakeClassificationDriftCount: input.finalLakeClassificationDriftCount,
  });
}
