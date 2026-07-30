import { clamp01 } from "@swooper/mapgen-core";

type LabelRng = (range: number, label: string) => number;

const HOTSPOT_SIGNAL_FLOOR = 0.1;

/**
 * Decides whether one admitted water tile seeds an ordinary island patch.
 *
 * Noise and ordinary margin frequency describe the baseline product while volcanism provides an
 * independent hotspot route. Microcontinents are deliberately excluded because their probability
 * is admitted once per map rather than once per candidate tile.
 */
export function shouldSeedIsland(params: {
  noiseValue: number;
  threshold: number;
  baseDenominator: number;
  hotspotSignal: number;
  hotspotDenominator: number;
  rng: LabelRng;
}): boolean {
  const baseAllowed =
    params.noiseValue >= params.threshold &&
    params.rng(params.baseDenominator, "island-seed") === 0;
  const hotspotWeight = clamp01(params.hotspotSignal);
  const weightedHotspotDenominator = Math.max(
    1,
    Math.round(params.hotspotDenominator / Math.max(HOTSPOT_SIGNAL_FLOOR, hotspotWeight))
  );
  const hotspotAllowed =
    hotspotWeight > 0 && params.rng(weightedHotspotDenominator, "hotspot-seed") === 0;
  return baseAllowed || hotspotAllowed;
}

/**
 * Draws the complete ordinary island-patch size, including its seed tile.
 */
export function resolveIslandPatchSize(clusterMaximum: number, rng: LabelRng): number {
  return 1 + rng(clusterMaximum, "island-cluster");
}
