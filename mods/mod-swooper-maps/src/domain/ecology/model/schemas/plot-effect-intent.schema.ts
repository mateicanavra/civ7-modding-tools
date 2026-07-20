import { Type } from "@swooper/mapgen-core/authoring/contracts";

/** Canonical Ecology intent vocabulary shared by planning artifacts and projection. */
export const PLOT_EFFECT_INTENT_KEYS = [
  "snow-light",
  "snow-medium",
  "snow-heavy",
  "sand",
  "burned",
  "frostbite",
  "desert-heat",
  "jungle-fever",
] as const;

export type PlotEffectIntentKey = (typeof PLOT_EFFECT_INTENT_KEYS)[number];

/**
 * Runtime contract for Ecology-owned plot-effect intent. Civ7 effect identifiers remain a
 * projection concern, so domain plans carry only this semantic vocabulary.
 */
export const PlotEffectIntentKeySchema = Type.Unsafe<PlotEffectIntentKey>(
  Type.String({
    description: "Abstract ecology plot-effect intent. Civ7 engine keys are chosen by projection.",
    enum: [...PLOT_EFFECT_INTENT_KEYS],
  })
);
