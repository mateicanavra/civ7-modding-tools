import { type Static, Type } from "@swooper/mapgen-core/authoring/schema";
import type { Tagged } from "type-fest";

/** A validated positive integer used by the official regional resource-minimum pass. */
export type PositiveResourceRegionMinimum = Tagged<number, "PositiveResourceRegionMinimum">;

const PositiveMinimumSchema = Type.Unsafe<PositiveResourceRegionMinimum>({
  type: "integer",
  minimum: 1,
  description: "Official resource floor for each positive landmass region with legal candidates.",
});

/**
 * Closed admission state for the official resource region-minimum pass.
 * Every admitted resource carries its official minimum, independent of age-requirement queries.
 */
export const ResourceRegionMinimumRequirementSchema = Type.Union([
  Type.Object(
    {
      kind: Type.Literal("not-applicable"),
      reason: Type.Literal("no-official-minimum"),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("required"),
      minimumPerLandmass: PositiveMinimumSchema,
      source: Type.Literal("official-resource"),
    },
    { additionalProperties: false }
  ),
]);

/** One admitted decision governing whether site selection must enforce a regional resource floor. */
export type ResourceRegionMinimumRequirement = Static<
  typeof ResourceRegionMinimumRequirementSchema
>;

/**
 * Admits the positive integer carried by a required regional-minimum decision.
 * Zero means the minimum is not applicable and must be handled before this boundary.
 */
export function admitPositiveResourceRegionMinimum(value: number): PositiveResourceRegionMinimum {
  if (!Number.isInteger(value) || value <= 0) {
    throw new RangeError(
      `Resource regional minimum must be a positive integer; received ${value}.`
    );
  }
  return value as PositiveResourceRegionMinimum;
}
