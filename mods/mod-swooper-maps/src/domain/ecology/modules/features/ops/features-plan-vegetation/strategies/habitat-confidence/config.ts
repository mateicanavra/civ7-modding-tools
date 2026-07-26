import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Arbitrates forest, rainforest, taiga, savanna woodland, and sagebrush steppe by confidence and stress.
 * It changes only authored controls; the shared operation remains the sole input and output authority.
 */
export default defineStrategy({
  id: "habitat-confidence",
  config: Type.Object({
    forestMinConfidence01: Type.Number({
      minimum: 0,
      maximum: 1,
      default: 0.16,
      description:
        "Forest admission threshold: lower-scoring temperate canopy signal remains biome cover, not feature intent.",
    }),
    rainforestMinConfidence01: Type.Number({
      minimum: 0,
      maximum: 1,
      default: 0.22,
      description:
        "Rainforest admission threshold: keeps tropical closed-canopy intent from absorbing all warm wet land.",
    }),
    taigaMinConfidence01: Type.Number({
      minimum: 0,
      maximum: 1,
      default: 0.12,
      description:
        "Taiga admission threshold: cold forest scores are lower-amplitude because cold stress is part of the habitat.",
    }),
    savannaWoodlandMinConfidence01: Type.Number({
      minimum: 0,
      maximum: 1,
      default: 0.1,
      description:
        "Savanna woodland admission threshold: warm seasonal woodland is patchier than closed forest.",
    }),
    sagebrushSteppeMinConfidence01: Type.Number({
      minimum: 0,
      maximum: 1,
      default: 0.08,
      description:
        "Sagebrush steppe admission threshold: semiarid open-cover scores are intentionally sparse and lower-amplitude.",
    }),
  }),
});
