export type MorphologyErosionPosture = "low" | "normal" | "high";

/** Maps the public erosion posture to the rate multiplier applied by the geomorphic-cycle step. */
export const MORPHOLOGY_EROSION_RATE_MULTIPLIER: Readonly<
  Record<MorphologyErosionPosture, number>
> = {
  low: 0.75,
  normal: 1.0,
  high: 1.35,
};
