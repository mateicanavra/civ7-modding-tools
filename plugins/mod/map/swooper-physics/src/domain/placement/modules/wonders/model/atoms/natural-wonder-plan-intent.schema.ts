import { type Static, Type } from "@swooper/mapgen-core/authoring/schema";

/** Maximum alternate anchors carried by one natural-wonder plan intent. */
export const NATURAL_WONDER_FALLBACK_LIMIT = 6;

/** One ranked natural-wonder intent and its deterministic fallback candidates. */
export const NaturalWonderPlanIntentSchema = Type.Object(
  {
    plotIndex: Type.Integer({ minimum: 0 }),
    featureType: Type.Integer({ minimum: 0 }),
    direction: Type.Integer(),
    elevation: Type.Integer({
      description: "Planned Civ7 elevation value at the natural-wonder anchor.",
    }),
    priority: Type.Number({ minimum: 0, maximum: 1 }),
    fallbacks: Type.Optional(
      Type.Array(
        Type.Object(
          {
            plotIndex: Type.Integer({
              minimum: 0,
              description: "Linear map index of the alternate anchor.",
            }),
            elevation: Type.Integer({
              description: "Planned Civ7 elevation at the alternate anchor.",
            }),
          },
          {
            additionalProperties: false,
            description:
              "One ranked alternate anchor with the elevation derived for that map cell.",
          }
        ),
        {
          maxItems: NATURAL_WONDER_FALLBACK_LIMIT,
          description:
            "Next-best candidates to try if Civ7 refuses the primary placement without changing wonder identity.",
        }
      )
    ),
  },
  {
    additionalProperties: false,
    description: "One planned natural wonder with ranked, non-overlapping anchor candidates.",
  }
);

/** Static value admitted by {@link NaturalWonderPlanIntentSchema}. */
export type NaturalWonderPlanIntent = Static<typeof NaturalWonderPlanIntentSchema>;
