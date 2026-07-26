/** Numeric thresholds resolved from one authored navigable-river density. */
export type NavigableRiverProjectionThresholds = Readonly<{
  endpointDischargePercentileMin: number;
  targetMajorTileFraction: number;
}>;

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
} as const satisfies Record<string, NavigableRiverProjectionThresholds>;

/** The authored density presets derived from the projection policy's canonical keys. */
export type NavigableRiverDensityKnob = keyof typeof NAVIGABLE_RIVER_PROJECTION_POLICY;
