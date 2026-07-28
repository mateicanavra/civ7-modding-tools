export type MorphologyVolcanismPosture = "low" | "normal" | "high";

export type MorphologyOrogenyPosture = "low" | "normal" | "high";

/** Scales the base volcano density selected by the public volcanism posture. */
export const MORPHOLOGY_VOLCANISM_BASE_DENSITY_MULTIPLIER: Readonly<
  Record<MorphologyVolcanismPosture, number>
> = {
  low: 0.7,
  normal: 1.0,
  high: 1.5,
};

/** Scales hotspot evidence in volcano ranking without changing other tectonic signals. */
export const MORPHOLOGY_VOLCANISM_HOTSPOT_WEIGHT_MULTIPLIER: Readonly<
  Record<MorphologyVolcanismPosture, number>
> = {
  low: 0.7,
  normal: 1.0,
  high: 1.5,
};

/** Scales the convergent-boundary bonus independently from base density and hotspot evidence. */
export const MORPHOLOGY_VOLCANISM_CONVERGENT_MULTIPLIER_MULTIPLIER: Readonly<
  Record<MorphologyVolcanismPosture, number>
> = {
  low: 0.85,
  normal: 1.0,
  high: 1.25,
};

/** Scales tectonic intensity before the mountain planner scores orogenic relief. */
export const MORPHOLOGY_OROGENY_TECTONIC_INTENSITY_MULTIPLIER: Readonly<
  Record<MorphologyOrogenyPosture, number>
> = {
  low: 0.8,
  normal: 1.0,
  high: 1.25,
};

/** Shifts mountain admission thresholds; high orogeny lowers the threshold to admit more peaks. */
export const MORPHOLOGY_OROGENY_MOUNTAIN_THRESHOLD_DELTA: Readonly<
  Record<MorphologyOrogenyPosture, number>
> = {
  low: 0.05,
  normal: 0,
  high: -0.05,
};

/** Shifts hill admission thresholds alongside mountain posture while preserving their separation. */
export const MORPHOLOGY_OROGENY_HILL_THRESHOLD_DELTA: Readonly<
  Record<MorphologyOrogenyPosture, number>
> = {
  low: 0.03,
  normal: 0,
  high: -0.03,
};
