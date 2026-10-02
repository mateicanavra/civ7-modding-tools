export type HydrologyRiverDensityKnob = "sparse" | "normal" | "dense";

/**
 * Minor-channel discharge percentiles by density knob. Lower thresholds admit more headwater
 * intent; normalization applies each value as a delta from `normal` to preserve map overrides.
 */
export const HYDROLOGY_RIVER_DENSITY_MINOR_PERCENTILE = {
  sparse: 0.88,
  normal: 0.82,
  dense: 0.75,
} as const satisfies Record<HydrologyRiverDensityKnob, number>;

/**
 * Major-channel discharge percentiles by density knob. These remain above the matching minor
 * thresholds so density tuning cannot collapse the two-level river hierarchy.
 */
export const HYDROLOGY_RIVER_DENSITY_MAJOR_PERCENTILE = {
  sparse: 0.97,
  normal: 0.94,
  dense: 0.9,
} as const satisfies Record<HydrologyRiverDensityKnob, number>;
