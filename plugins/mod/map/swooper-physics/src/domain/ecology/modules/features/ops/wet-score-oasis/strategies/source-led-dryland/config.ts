import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Scores a local source/demand balance in climatic dryness, independent of whole-tile lushness. */
export default defineStrategy({
  id: "source-led-dryland",
  config: Type.Object({
    dryMin01: Type.Number({
      default: 0.6, minimum: 0, maximum: 1,
      description: "Climatic aridity where oasis dry-habitat support begins.",
    }),
    dryMax01: Type.Number({
      default: 0.95, minimum: 0, maximum: 1,
      description: "Climatic aridity where oasis dry-habitat support saturates.",
    }),
  }, { additionalProperties: false, description: "Climatic context for the bounded local source/demand response." }),
});
