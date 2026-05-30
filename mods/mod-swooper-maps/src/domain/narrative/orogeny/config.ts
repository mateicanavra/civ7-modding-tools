import { Type, type Static } from "@swooper/mapgen-core/authoring";

/**
 * Story orogeny config belongs with the orogeny tagging owner because these
 * tunables decide which mountain belts affect windward/lee climate. Keeping
 * the schema here prevents the root narrative config facade from becoming a
 * multi-owner strategy catalog.
 */
export const OrogenyTunablesSchema = Type.Object(
  {
    /** Search radius (tiles) for windward/lee tagging around detected belts. */
    radius: Type.Optional(
      Type.Number({
        description: "Search radius (tiles) for windward/lee tagging around detected belts.",
        default: 2,
        minimum: 0,
      })
    ),
    /** Minimum belt size floor before windward/lee tagging is applied (tiles). */
    beltMinLength: Type.Optional(
      Type.Number({
        description:
          "Minimum belt size floor before windward/lee tagging is applied (tiles). Larger maps auto-scale this upward.",
        default: 30,
        minimum: 0,
      })
    ),
    /** Rainfall boost applied on windward belts (rainfall units). */
    windwardBoost: Type.Optional(
      Type.Number({
        description: "Rainfall boost applied on windward orogeny belts (rainfall units).",
        default: 5,
      })
    ),
    /** Multiplier applied to lee-side drying (>= 1.0). */
    leeDrynessAmplifier: Type.Optional(
      Type.Number({
        description: "Multiplier applied to lee-side drying (>= 1.0).",
        default: 1.2,
        minimum: 1,
      })
    ),
  },
  { additionalProperties: false }
);

export type OrogenyTunables = Static<typeof OrogenyTunablesSchema>;
