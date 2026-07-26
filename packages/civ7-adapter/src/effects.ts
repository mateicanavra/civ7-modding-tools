export const ENGINE_EFFECT_TAGS = {
  biomesApplied: "effect:engine.biomesApplied",
  featuresApplied: "effect:engine.featuresApplied",
} as const;

export type EngineEffectTagId = (typeof ENGINE_EFFECT_TAGS)[keyof typeof ENGINE_EFFECT_TAGS];
