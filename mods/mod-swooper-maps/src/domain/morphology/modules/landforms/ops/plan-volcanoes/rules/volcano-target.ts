import { clamp } from "@swooper/mapgen-core/lib/math";

type VolcanoCountConfig = Readonly<{
  baseDensity: number;
  minVolcanoes: number;
  maxVolcanoes: number;
}>;

/**
 * Resolves the desired volcano count within the admitted authored count interval.
 *
 * Candidate availability and wrapped-hex spacing may still leave the completed plan below this
 * target; the planner never fabricates an invalid placement merely to satisfy the requested floor.
 */
export function resolveTargetVolcanoes(landTileCount: number, config: VolcanoCountConfig): number {
  const densityTarget = Math.round(landTileCount * config.baseDensity);
  return clamp(densityTarget, config.minVolcanoes, config.maxVolcanoes);
}
