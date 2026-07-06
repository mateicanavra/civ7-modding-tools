export type MorphologyVolcanismPosture = "low" | "normal" | "high";

export type MorphologyOrogenyPosture = "low" | "normal" | "high";

export const MORPHOLOGY_VOLCANISM_BASE_DENSITY_MULTIPLIER: Readonly<
  Record<MorphologyVolcanismPosture, number>
> = {
  low: 0.7,
  normal: 1.0,
  high: 1.5,
};

export const MORPHOLOGY_VOLCANISM_HOTSPOT_WEIGHT_MULTIPLIER: Readonly<
  Record<MorphologyVolcanismPosture, number>
> = {
  low: 0.7,
  normal: 1.0,
  high: 1.5,
};

export const MORPHOLOGY_VOLCANISM_CONVERGENT_MULTIPLIER_MULTIPLIER: Readonly<
  Record<MorphologyVolcanismPosture, number>
> = {
  low: 0.85,
  normal: 1.0,
  high: 1.25,
};

export const MORPHOLOGY_OROGENY_TECTONIC_INTENSITY_MULTIPLIER: Readonly<
  Record<MorphologyOrogenyPosture, number>
> = {
  low: 0.8,
  normal: 1.0,
  high: 1.25,
};

export const MORPHOLOGY_OROGENY_MOUNTAIN_THRESHOLD_DELTA: Readonly<
  Record<MorphologyOrogenyPosture, number>
> = {
  low: 0.05,
  normal: 0,
  high: -0.05,
};

export const MORPHOLOGY_OROGENY_HILL_THRESHOLD_DELTA: Readonly<
  Record<MorphologyOrogenyPosture, number>
> = {
  low: 0.03,
  normal: 0,
  high: -0.03,
};
