import {
  choosePhysicalCandidate,
  confidenceFromScore01,
  type PhysicalCandidate,
  stressFromConfidence01,
} from "../../../model/policy/feature-score-selection.js";
import type { FeatureIntentKey } from "../../../model/schemas/index.js";
import type { PlanReefsTypes } from "../types.js";

/**
 * Reef planning scores describe broad ocean suitability; they are not placement
 * commands by themselves. This policy keeps the reef-family intent threshold
 * with the reef planner so atoll, warm reef, cold reef, and lotus behavior can
 * evolve with reef habitat physics instead of routing through a generic helper.
 */
export function admitReefIntent(
  candidate: Readonly<{ confidence01: number }>,
  policy: Readonly<{ minConfidence01: number }>
): boolean {
  const minConfidence01 = Number.isFinite(policy.minConfidence01)
    ? Math.max(0, Math.min(1, policy.minConfidence01))
    : 1;
  return candidate.confidence01 >= minConfidence01;
}

/**
 * Reef families are patch and bank features. A strong score identifies habitat;
 * the stride keeps repeated adjacent habitat from turning into a carpet while
 * preserving deterministic clusters that still look like reefs, atolls, or
 * lake lotus patches instead of random thinning.
 */
export function admitReefStride(
  candidate: Readonly<{ tileIndex: number }>,
  policy: Readonly<{ stride: number }>
): boolean {
  const stride = Number.isFinite(policy.stride) ? Math.max(1, policy.stride | 0) : 1;
  return candidate.tileIndex % stride === 0;
}

/**
 * Selects the strongest reef-family candidate for one tile under the shared habitat law.
 * Lotus is eligible only on admitted lake tiles, so spacing strategies cannot diverge on habitat.
 */
export function selectReefIntentCandidate(
  input: Pick<
    PlanReefsTypes["input"],
    "scoreReef01" | "scoreColdReef01" | "scoreAtoll01" | "scoreLotus01" | "lakeMask"
  >,
  tileIndex: number
): PhysicalCandidate<FeatureIntentKey> | null {
  const confidence = {
    reef: confidenceFromScore01(input.scoreReef01[tileIndex] ?? 0),
    coldReef: confidenceFromScore01(input.scoreColdReef01[tileIndex] ?? 0),
    atoll: confidenceFromScore01(input.scoreAtoll01[tileIndex] ?? 0),
    lotus: confidenceFromScore01(
      input.lakeMask[tileIndex] === 1 ? (input.scoreLotus01[tileIndex] ?? 0) : 0
    ),
  };

  return choosePhysicalCandidate([
    reefCandidate("reef", confidence.reef, tileIndex),
    reefCandidate("cold-reef", confidence.coldReef, tileIndex),
    reefCandidate("atoll", confidence.atoll, tileIndex),
    reefCandidate("lotus", confidence.lotus, tileIndex),
  ]);
}

function reefCandidate(
  feature: FeatureIntentKey,
  confidence01: number,
  tileIndex: number
): PhysicalCandidate<FeatureIntentKey> {
  return {
    feature,
    confidence01,
    stress01: stressFromConfidence01(confidence01),
    tileIndex,
  };
}
