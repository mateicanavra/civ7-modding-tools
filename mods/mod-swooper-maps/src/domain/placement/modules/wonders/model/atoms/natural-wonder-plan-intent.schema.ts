import { type Static, Type } from "@swooper/mapgen-core/authoring/schema";

/** One ranked natural-wonder intent and its deterministic fallback anchors. */
export const NaturalWonderPlanIntentSchema = Type.Object(
  {
    plotIndex: Type.Integer({ minimum: 0 }),
    featureType: Type.Integer({ minimum: 0 }),
    direction: Type.Integer(),
    elevation: Type.Integer({
      description: "Planned Civ7 elevation value at the natural-wonder anchor.",
    }),
    priority: Type.Number({ minimum: 0, maximum: 1 }),
    fallbackPlotIndices: Type.Optional(
      Type.Array(Type.Integer({ minimum: 0 }), {
        description:
          "Next-best anchors to try if Civ7 refuses the primary placement without changing wonder identity.",
      })
    ),
  },
  {
    additionalProperties: false,
    description: "One planned natural wonder with ranked, non-overlapping anchor candidates.",
  }
);

/** Static value admitted by {@link NaturalWonderPlanIntentSchema}. */
export type NaturalWonderPlanIntent = Static<typeof NaturalWonderPlanIntentSchema>;
