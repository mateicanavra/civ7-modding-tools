import { Type } from "@swooper/mapgen-core/authoring/contracts";

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

export const PlotEffectIntentKeySchema = Type.Unsafe<PlotEffectIntentKey>(
  Type.String({
    description: "Abstract ecology plot-effect intent. Civ7 engine keys are chosen by projection.",
    enum: [...PLOT_EFFECT_INTENT_KEYS],
  })
);
