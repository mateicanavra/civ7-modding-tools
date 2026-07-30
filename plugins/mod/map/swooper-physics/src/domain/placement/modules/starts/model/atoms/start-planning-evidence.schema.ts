import { Type } from "@swooper/mapgen-core/authoring/schema";

/** Hard-screen reason that excluded a tile from start candidacy. */
export const StartRejectionReasonSchema = Type.Union([
  Type.Literal("water"),
  Type.Literal("lake"),
  Type.Literal("mountain"),
  Type.Literal("volcano"),
  Type.Literal("natural-wonder"),
  Type.Literal("single-tile-island"),
  Type.Literal("insufficient-landmass"),
  Type.Literal("insufficient-expansion"),
  Type.Literal("insufficient-island-cluster"),
]);

/** Aggregate count for one start-candidate rejection reason. */
export const StartRejectionCountSchema = Type.Object(
  {
    reason: StartRejectionReasonSchema,
    count: Type.Integer({ minimum: 0 }),
  },
  { additionalProperties: false }
);

/** Aggregate start-candidate counts by viability band. */
export const StartTierCountsSchema = Type.Object(
  {
    primary: Type.Integer({ minimum: 0 }),
    islandCluster: Type.Integer({ minimum: 0 }),
    marginal: Type.Integer({ minimum: 0 }),
  },
  { additionalProperties: false }
);

/** One coverage assertion showing whether a scoring input was provided or imputed. */
export const StartInputCoverageRowSchema = Type.Object(
  {
    input: Type.String(),
    status: Type.Union([Type.Literal("provided"), Type.Literal("imputed")]),
    affectsComponent: Type.String(),
  },
  {
    additionalProperties: false,
    description: "Coverage evidence for one optional player-start scoring input.",
  }
);
