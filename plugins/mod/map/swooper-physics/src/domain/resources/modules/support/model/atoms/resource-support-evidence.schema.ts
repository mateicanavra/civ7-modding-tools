import { type Static, Type } from "@swooper/mapgen-core/authoring/schema";

/** Unresolved terminal support objective after the bounded adjustment pass. */
export const ResourceSupportShortfallSchema = Type.Object(
  {
    seatIndex: Type.Integer({ minimum: 0 }),
    reason: Type.Union(
      [
        Type.Literal("no-admitted-adjustment"),
        Type.Literal("equity-unresolvable"),
        Type.Literal("floor-budget-exhausted"),
        Type.Literal("equity-budget-exhausted"),
        Type.Literal("adjustment-disabled"),
      ],
      {
        description:
          "Why the support objective remained unresolved after applying all admitted moves and additions.",
      }
    ),
    missing: Type.Integer({
      minimum: 1,
      description: "Terminal floor deficit or equity-gap excess measured in support units.",
    }),
  },
  {
    additionalProperties: false,
    description: "One explicit unresolved support-floor or equity objective.",
  }
);

/** Per-seat resource support measured before and after adjustment. */
export const ResourceSupportPerStartSchema = Type.Object(
  {
    seatIndex: Type.Integer({ minimum: 0 }),
    playerId: Type.Integer({ minimum: 0 }),
    plotIndex: Type.Integer({ minimum: 0 }),
    supportBefore: Type.Integer({ minimum: 0 }),
    supportAfter: Type.Integer({ minimum: 0 }),
  },
  { additionalProperties: false }
);

/** Cross-player support gap before and after adjustment. */
export const ResourceSupportEquitySchema = Type.Object(
  {
    gapBefore: Type.Union([Type.Integer({ minimum: 0 }), Type.Null()]),
    gapAfter: Type.Union([Type.Integer({ minimum: 0 }), Type.Null()]),
  },
  {
    additionalProperties: false,
    description: "Cross-player maximum-minus-minimum support gap; null with fewer than two seats.",
  }
);

/** Settings that bound and explain one resource support-adjustment pass. */
export const ResourceSupportSettingsSchema = Type.Object(
  {
    enabled: Type.Boolean(),
    supportFloor: Type.Integer({ minimum: 0, maximum: 6 }),
    supportRadiusTiles: Type.Integer({ minimum: 1, maximum: 8 }),
    equityTolerance: Type.Integer({ minimum: 0, maximum: 8 }),
    strength: Type.Number({ minimum: 0, maximum: 1 }),
  },
  {
    additionalProperties: false,
    description: "Admitted bounds and product targets governing support adjustment.",
  }
);

/** Static resource-support shortfall row. */
export type ResourceSupportShortfall = Static<typeof ResourceSupportShortfallSchema>;
