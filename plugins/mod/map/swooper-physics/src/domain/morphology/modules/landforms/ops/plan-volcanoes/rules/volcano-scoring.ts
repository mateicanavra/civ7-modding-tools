import { BOUNDARY_TYPE } from "@swooper/mapgen-core/lib/plates";
import {
  VOLCANO_INTENT_KIND,
  type VolcanoIntentKind,
} from "../../../model/atoms/volcano-intent.schema.js";

type LabelRng = (range: number, label: string) => number;

type VolcanoScoringConfig = Readonly<{
  boundaryThreshold: number;
  boundaryWeight: number;
  convergentMultiplier: number;
  transformMultiplier: number;
  divergentMultiplier: number;
  hotspotWeight: number;
  shieldPenalty: number;
  randomJitter: number;
}>;

const JITTER_RESOLUTION = 1000;

function boundaryMultiplier(
  boundaryType: number,
  config: VolcanoScoringConfig
): number | undefined {
  if (boundaryType === BOUNDARY_TYPE.convergent) return config.convergentMultiplier;
  if (boundaryType === BOUNDARY_TYPE.divergent) return config.divergentMultiplier;
  if (boundaryType === BOUNDARY_TYPE.transform) return config.transformMultiplier;
  return undefined;
}

/**
 * Scores one admitted land tile from boundary proximity, volcanism, shield stability, and jitter.
 *
 * Boundary evidence contributes only when the tile carries a recognized boundary regime;
 * otherwise the candidate remains an intraplate placement supported by the volcanism field.
 */
export function scoreVolcanoCandidate(params: {
  boundaryCloseness01: number;
  boundaryType: number;
  shieldStability01: number;
  volcanism01: number;
  config: VolcanoScoringConfig;
  rng: LabelRng;
}): number {
  const { boundaryCloseness01, boundaryType, shieldStability01, volcanism01, config, rng } = params;
  const multiplier = boundaryMultiplier(boundaryType, config);
  let score = 0;

  if (multiplier !== undefined && boundaryCloseness01 >= config.boundaryThreshold) {
    const boundaryBand =
      config.boundaryThreshold === 1
        ? 1
        : (boundaryCloseness01 - config.boundaryThreshold) / (1 - config.boundaryThreshold);
    score = boundaryBand * config.boundaryWeight * multiplier;
  } else {
    score = config.hotspotWeight * (1 - boundaryCloseness01);
  }

  score += volcanism01 * config.hotspotWeight;
  score *= 1 - shieldStability01 * config.shieldPenalty;

  if (config.randomJitter > 0) {
    score += (rng(JITTER_RESOLUTION, "volcano-jitter") / JITTER_RESOLUTION) * config.randomJitter;
  }
  return score;
}

/**
 * Classifies a planned volcano by the exact tectonic setting supported by its active-margin
 * evidence. A retained historical regime away from the admitted boundary band remains intraplate.
 */
export function classifyVolcanoIntentKind(
  boundaryType: number,
  boundaryCloseness01: number,
  boundaryThreshold: number
): VolcanoIntentKind {
  if (boundaryCloseness01 < boundaryThreshold) return VOLCANO_INTENT_KIND.intraplate;
  if (boundaryType === BOUNDARY_TYPE.convergent) {
    return VOLCANO_INTENT_KIND.convergentMargin;
  }
  if (boundaryType === BOUNDARY_TYPE.divergent) {
    return VOLCANO_INTENT_KIND.divergentMargin;
  }
  if (boundaryType === BOUNDARY_TYPE.transform) {
    return VOLCANO_INTENT_KIND.transformMargin;
  }
  return VOLCANO_INTENT_KIND.intraplate;
}
