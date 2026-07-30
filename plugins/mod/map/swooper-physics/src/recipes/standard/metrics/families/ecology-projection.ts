import { type Static, Type } from "typebox";

/** Closed measurements emitted after the Standard biome-projection step. */
const StandardBiomeProjectionMeasurementsSchema = Type.Object(
  {
    version: Type.Literal(1, {
      description: "Schema version for the Standard biome-projection measurement record.",
    }),
    collapsedBindingCount: Type.Integer({
      minimum: 0,
      description:
        "Number of projected land tiles whose Ecology symbols share one Civ7 biome identity.",
    }),
    landWaterMismatchCount: Type.Integer({
      minimum: 0,
      description:
        "Number of projected tiles where Morphology land intent disagrees with current Civ7 water classification.",
    }),
    collisionEngineBiomeIds: Type.Array(Type.Integer({ minimum: 0 }), {
      description:
        "Sorted Civ7 biome identities shared by more than one Ecology biome symbol during projection.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Standard recipe measurements of Ecology biome projection into current Civ7 engine state.",
  }
);

/** Measurements projected from one completed Standard biome-projection step. */
export type StandardBiomeProjectionMeasurements = Static<
  typeof StandardBiomeProjectionMeasurementsSchema
>;

/** Closed measurements emitted after the Standard feature-application step. */
export const StandardFeatureProjectionMeasurementsSchema = Type.Object(
  {
    version: Type.Literal(1, {
      description: "Schema version for the Standard feature-projection measurement record.",
    }),
    attempted: Type.Integer({
      minimum: 0,
      description: "Number of admitted Ecology feature intents presented to Civ7.",
    }),
    applied: Type.Integer({
      minimum: 0,
      description: "Number of admitted Ecology feature intents written to Civ7.",
    }),
    rejected: Type.Integer({
      minimum: 0,
      description: "Number of admitted Ecology feature intents not written to Civ7.",
    }),
    rejectedCanHaveFeature: Type.Integer({
      minimum: 0,
      description: "Number of in-bounds, known feature intents rejected by Civ7 surface legality.",
    }),
    rejectedOutOfBounds: Type.Integer({
      minimum: 0,
      description: "Number of feature intents rejected because their coordinates left the map.",
    }),
    attemptedByFeature: Type.Record(Type.String(), Type.Integer({ minimum: 0 }), {
      description: "Attempted feature-intent counts keyed by official Civ7 feature identity.",
    }),
    appliedByFeature: Type.Record(Type.String(), Type.Integer({ minimum: 0 }), {
      description: "Applied feature-intent counts keyed by official Civ7 feature identity.",
    }),
    rejectedCanHaveFeatureByFeature: Type.Record(Type.String(), Type.Integer({ minimum: 0 }), {
      description: "Civ7 surface-legality rejection counts keyed by official feature identity.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Standard recipe measurements of Ecology feature intent application into current Civ7 engine state.",
  }
);

/** Measurements projected from one completed Standard feature-application step. */
export type StandardFeatureProjectionMeasurements = Static<
  typeof StandardFeatureProjectionMeasurementsSchema
>;

/** Causal evidence needed to measure one completed biome projection. */
export type StandardBiomeProjectionMeasurementInput = Readonly<{
  collapsedBindingCount: number;
  landWaterMismatchCount: number;
  collisionEngineBiomeIds: readonly number[];
}>;

/** Causal evidence needed to measure one completed feature projection. */
export type StandardFeatureProjectionMeasurementInput = Readonly<{
  attempted: number;
  applied: number;
  rejected: number;
  rejectedCanHaveFeature: number;
  rejectedOutOfBounds: number;
  attemptedByFeature: Readonly<Record<string, number>>;
  appliedByFeature: Readonly<Record<string, number>>;
  rejectedCanHaveFeatureByFeature: Readonly<Record<string, number>>;
}>;

/**
 * Projects neutral Standard product measurements from one completed biome projection.
 * The measurement retains binding and land/water parity evidence without treating the projected
 * biome identities as engine readback or immutable pipeline state.
 */
export function measureStandardBiomeProjection(
  input: StandardBiomeProjectionMeasurementInput
): StandardBiomeProjectionMeasurements {
  return Object.freeze({
    version: 1,
    collapsedBindingCount: input.collapsedBindingCount,
    landWaterMismatchCount: input.landWaterMismatchCount,
    collisionEngineBiomeIds: [...input.collisionEngineBiomeIds],
  });
}

/**
 * Projects neutral Standard product measurements from one completed feature mutation.
 * Count records are copied so the metrics sink never retains mutable step-local accumulators.
 */
export function measureStandardFeatureProjection(
  input: StandardFeatureProjectionMeasurementInput
): StandardFeatureProjectionMeasurements {
  return Object.freeze({
    version: 1,
    attempted: input.attempted,
    applied: input.applied,
    rejected: input.rejected,
    rejectedCanHaveFeature: input.rejectedCanHaveFeature,
    rejectedOutOfBounds: input.rejectedOutOfBounds,
    attemptedByFeature: Object.freeze({ ...input.attemptedByFeature }),
    appliedByFeature: Object.freeze({ ...input.appliedByFeature }),
    rejectedCanHaveFeatureByFeature: Object.freeze({
      ...input.rejectedCanHaveFeatureByFeature,
    }),
  });
}
