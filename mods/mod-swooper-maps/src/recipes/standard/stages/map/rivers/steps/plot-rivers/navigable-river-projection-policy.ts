/** The authored density presets accepted by the step-local projection policy. */
export type NavigableRiverDensityKnob = "sparse" | "normal" | "dense";

/**
 * Sparse, normal, and dense navigable-river projection thresholds for endpoint-discharge
 * percentile and major-river tile coverage.
 */
export const NAVIGABLE_RIVER_PROJECTION_POLICY = {
  sparse: {
    endpointDischargePercentileMin: 0.97,
    targetMajorTileFraction: 0.18,
  },
  normal: {
    endpointDischargePercentileMin: 0.94,
    targetMajorTileFraction: 0.28,
  },
  dense: {
    endpointDischargePercentileMin: 0.9,
    targetMajorTileFraction: 0.4,
  },
} as const satisfies Record<
  NavigableRiverDensityKnob,
  Readonly<{
    endpointDischargePercentileMin: number;
    targetMajorTileFraction: number;
  }>
>;
