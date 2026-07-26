export type HydrologyRiverDensityKnob = "sparse" | "normal" | "dense";
export type HydrologyLakeinessKnob = "few" | "normal" | "many";

/**
 * Lakeiness tunes Hydrology-owned terminal-basin admission, not Civ7's lake
 * frequency. Local routing creates many tiny one-tile sinks; each level admits
 * only a small number of high-discharge basins and expands them one upstream
 * hop so visible lakes read as basin features instead of circular sink noise.
 */
export const HYDROLOGY_LAKEINESS_TERMINAL_BASIN_POLICY = {
  few: {
    sinkDischargePercentileMin: 0.97,
    maxLakeLandFraction: 0.0015,
    maxUpstreamSteps: 1,
  },
  normal: {
    sinkDischargePercentileMin: 0.94,
    maxLakeLandFraction: 0.003,
    maxUpstreamSteps: 1,
  },
  many: {
    sinkDischargePercentileMin: 0.9,
    maxLakeLandFraction: 0.006,
    maxUpstreamSteps: 1,
  },
} as const satisfies Record<
  HydrologyLakeinessKnob,
  Readonly<{
    sinkDischargePercentileMin: number;
    maxLakeLandFraction: number;
    maxUpstreamSteps: number;
  }>
>;

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
