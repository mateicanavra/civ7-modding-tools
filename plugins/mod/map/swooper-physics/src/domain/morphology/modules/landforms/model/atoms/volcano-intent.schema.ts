import { type Static, Type } from "@swooper/mapgen-core/authoring/schema";

/** Stable identities for the tectonic setting represented by one planned volcano. */
export const VOLCANO_INTENT_KIND = {
  convergentMargin: "convergentMargin",
  divergentMargin: "divergentMargin",
  transformMargin: "transformMargin",
  intraplate: "intraplate",
} as const;

/** Closed tectonic-setting classification carried by a planned volcano. */
export const VolcanoIntentKindSchema = Type.Union(
  [
    Type.Literal(VOLCANO_INTENT_KIND.convergentMargin),
    Type.Literal(VOLCANO_INTENT_KIND.divergentMargin),
    Type.Literal(VOLCANO_INTENT_KIND.transformMargin),
    Type.Literal(VOLCANO_INTENT_KIND.intraplate),
  ],
  {
    description:
      "Tectonic setting supported by the admitted boundary regime; it does not claim an unobserved eruption mechanism.",
  }
);

/** One immutable volcano placement intent derived from admitted Morphology evidence. */
export const VolcanoIntentSchema = Type.Object(
  {
    tileIndex: Type.Integer({
      minimum: 0,
      description: "Row-major land-tile index selected for a planned volcano.",
    }),
    kind: VolcanoIntentKindSchema,
    strength01: Type.Number({
      minimum: 0,
      maximum: 1,
      description: "Normalized volcanism evidence at the selected tile.",
    }),
  },
  {
    additionalProperties: false,
    description: "One planned volcano with its tile, tectonic setting, and evidence strength.",
  }
);

/** One planned volcano placement intent. */
export type VolcanoIntent = Static<typeof VolcanoIntentSchema>;

/** Tectonic setting assigned to one planned volcano. */
export type VolcanoIntentKind = Static<typeof VolcanoIntentKindSchema>;
