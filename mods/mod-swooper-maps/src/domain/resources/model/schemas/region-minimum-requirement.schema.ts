import { type Static, Type } from "@swooper/mapgen-core/authoring/contracts";
import type { Tagged } from "type-fest";

/** A validated positive integer used by the official regional resource-minimum pass. */
export type PositiveResourceRegionMinimum = Tagged<number, "PositiveResourceRegionMinimum">;

const PositiveMinimumSchema = Type.Unsafe<PositiveResourceRegionMinimum>({
  type: "integer",
  minimum: 1,
  description: "Official per-region resource floor before the active map-size modifier is applied.",
});

const StaticRequirementBasisSchema = Type.Union(
  [
    Type.Immutable(Type.Tuple([Type.Literal("staple")])),
    Type.Immutable(Type.Tuple([Type.Literal("unlocks-civ")])),
    Type.Immutable(Type.Tuple([Type.Literal("staple"), Type.Literal("unlocks-civ")])),
  ],
  {
    description:
      "Canonical nonempty roster-independent official flags that justify the headless requirement decision.",
  }
);

/**
 * Closed admission state for the official resource region-minimum pass.
 *
 * Engine observations preserve roster-dependent decisions. Headless execution may admit only
 * roster-independent official flags; unavailable conditional decisions remain unresolved.
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
      minimumPerHemisphere: PositiveMinimumSchema,
      source: Type.Literal("engine"),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("required"),
      minimumPerHemisphere: PositiveMinimumSchema,
      source: Type.Literal("static-unconditional"),
      basis: StaticRequirementBasisSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("not-required"),
      minimumPerHemisphere: PositiveMinimumSchema,
      source: Type.Literal("engine"),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("unresolved"),
      minimumPerHemisphere: PositiveMinimumSchema,
      source: Type.Literal("engine-unavailable"),
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
