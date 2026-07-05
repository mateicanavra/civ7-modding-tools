export type NavigableRiverDensityKnob = "sparse" | "normal" | "dense";

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
