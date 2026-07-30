import { clamp01, clampInt } from "@swooper/mapgen-core/lib/math";

export type HydrologyRiverDensityKnob = "sparse" | "normal" | "dense";
export type HydrologyLakeinessKnob = "few" | "normal" | "many";

type HydrologyTerminalBasinControls = Readonly<{
  sinkDischargePercentileMin: number;
  maxLakeLandFraction: number;
  maxUpstreamSteps: number;
}>;

const MAX_LAKE_UPSTREAM_STEPS = 8;

/**
 * Lakeiness tunes Hydrology-owned terminal-basin admission, not Civ7's lake
 * frequency. Local routing creates many tiny one-tile sinks; each level admits
 * only a small number of high-discharge basins and expands them one upstream
 * hop so visible lakes read as basin features instead of circular sink noise.
 */
const HYDROLOGY_LAKEINESS_TERMINAL_BASIN_POLICY = {
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
} as const satisfies Record<HydrologyLakeinessKnob, HydrologyTerminalBasinControls>;

/**
 * Applies a lakeiness posture relative to the directly authored terminal-basin controls.
 *
 * `normal` is an exact no-op. Other postures preserve the author's baseline while
 * shifting percentile and expansion budgets by the same policy relation used by shipped maps.
 */
export function applyHydrologyLakeinessPolicy(
  authored: HydrologyTerminalBasinControls,
  lakeiness: HydrologyLakeinessKnob
): HydrologyTerminalBasinControls {
  const selected = HYDROLOGY_LAKEINESS_TERMINAL_BASIN_POLICY[lakeiness];
  const normal = HYDROLOGY_LAKEINESS_TERMINAL_BASIN_POLICY.normal;
  const sinkDischargePercentileDelta =
    selected.sinkDischargePercentileMin - normal.sinkDischargePercentileMin;
  const maxLakeLandFractionScale = selected.maxLakeLandFraction / normal.maxLakeLandFraction;
  const maxUpstreamStepsDelta = selected.maxUpstreamSteps - normal.maxUpstreamSteps;

  return {
    sinkDischargePercentileMin: clamp01(
      authored.sinkDischargePercentileMin + sinkDischargePercentileDelta
    ),
    maxLakeLandFraction: clamp01(authored.maxLakeLandFraction * maxLakeLandFractionScale),
    maxUpstreamSteps: clampInt(
      authored.maxUpstreamSteps + maxUpstreamStepsDelta,
      0,
      MAX_LAKE_UPSTREAM_STEPS
    ),
  };
}

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
