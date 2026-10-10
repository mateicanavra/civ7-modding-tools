import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Scores a local source/demand balance in climatic dryness, independent of whole-tile fertility. */
export default defineStrategy({
  id: "source-led-dryland",
  config: Type.Object({
    dryMin01: Type.Number({
      default: 0.45, minimum: 0, maximum: 1,
      description: "Climatic aridity where watering-hole dry-habitat support begins.",
    }),
    dryMax01: Type.Number({
      default: 0.85, minimum: 0, maximum: 1,
      description: "Climatic aridity where watering-hole dry-habitat support saturates.",
    }),
  }, { additionalProperties: false, description: "Climatic context for the bounded local source/demand response." }),
});
