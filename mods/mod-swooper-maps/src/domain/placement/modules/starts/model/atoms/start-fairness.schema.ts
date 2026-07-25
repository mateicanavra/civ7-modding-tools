import { type Static, Type } from "@swooper/mapgen-core/authoring/schema";

const StartFairnessRelaxationSchema = Type.Object(
  {
    seatIndex: Type.Integer({ minimum: 0 }),
    kind: Type.Union([Type.Literal("spacing"), Type.Literal("region"), Type.Literal("quality")]),
    from: Type.Number(),
    to: Type.Number(),
  },
  {
    additionalProperties: false,
    description: "One explicit relaxation applied while seating a player.",
  }
);

const StartFairnessSwapSchema = Type.Object(
  {
    seatIndex: Type.Integer({ minimum: 0 }),
    fromPlotIndex: Type.Integer({ minimum: 0 }),
    toPlotIndex: Type.Integer({ minimum: 0 }),
    fromScore: Type.Number(),
    toScore: Type.Number(),
  },
  {
    additionalProperties: false,
    description: "One deterministic seat swap applied to improve cross-player parity.",
  }
);

/** Cross-player parity evidence retained after start selection and balancing. */
export const StartFairnessReportSchema = Type.Object(
  {
    tolerance: Type.Number({ minimum: 0 }),
    parity: Type.Array(Type.Number(), {
      description: "Published viability score for every admitted seat.",
    }),
    worstPairGap: Type.Union([Type.Number(), Type.Null()], {
      description: "Largest score gap between any two seated starts.",
    }),
    balanced: Type.Boolean({
      description: "Whether the terminal worst-pair gap is within the admitted tolerance.",
    }),
    swaps: Type.Array(StartFairnessSwapSchema, {
      description: "Deterministic balancing swaps applied to reduce the worst-pair gap.",
    }),
    relaxations: Type.Array(StartFairnessRelaxationSchema, {
      description: "Every spacing, region, or quality relaxation taken during selection.",
    }),
  },
  {
    additionalProperties: false,
    description: "Terminal fairness audit for one set of player-start assignments.",
  }
);

/** Static value admitted by {@link StartFairnessReportSchema}. */
export type StartFairnessReport = Static<typeof StartFairnessReportSchema>;
