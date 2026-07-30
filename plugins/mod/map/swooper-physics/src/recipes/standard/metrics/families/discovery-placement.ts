import { type Static, Type } from "typebox";

/** Successful observation emitted after Civ7's official discovery generator completes. */
export const StandardDiscoveryPlacementMeasurementsSchema = Type.Object(
  {
    version: Type.Literal(1, {
      description: "Schema version for the Standard discovery-placement observation.",
    }),
    attemptedCount: Type.Integer({
      minimum: 0,
      description:
        "Number of discovery placements attempted by Civ7's official generator during this run.",
    }),
    placedCount: Type.Integer({
      minimum: 0,
      description:
        "Number of attempted discovery placements accepted by Civ7's live narrative system.",
    }),
    rejectedCount: Type.Integer({
      minimum: 0,
      description:
        "Number of attempted discovery placements Civ7 did not accept, derived from attempted minus placed.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Completed discovery-generation counts observed from Civ7; this is runtime evidence, not a Swooper-authored placement plan.",
  }
);

/** Counts retained from one successful invocation of Civ7's official discovery generator. */
export type StandardDiscoveryPlacementMeasurements = Static<
  typeof StandardDiscoveryPlacementMeasurementsSchema
>;

type StandardDiscoveryPlacementMeasurementInput = Pick<
  StandardDiscoveryPlacementMeasurements,
  "attemptedCount" | "placedCount"
>;

/**
 * Closes successful discovery-generation counts into immutable recipe metrics evidence.
 *
 * Civ7 remains the materialization authority. This projection preserves only the generator's
 * attempted, accepted, and rejected totals; it does not manufacture per-tile intent or outcomes.
 */
export function measureStandardDiscoveryPlacement(
  input: StandardDiscoveryPlacementMeasurementInput
): StandardDiscoveryPlacementMeasurements {
  if (input.placedCount > input.attemptedCount) {
    throw new Error(
      `Discovery placement accepted ${input.placedCount} of ${input.attemptedCount} attempts.`
    );
  }
  return Object.freeze({
    version: 1,
    attemptedCount: input.attemptedCount,
    placedCount: input.placedCount,
    rejectedCount: input.attemptedCount - input.placedCount,
  });
}
