import { clamp01, normalizeRange } from "@swooper/mapgen-core/lib/math";

/** Normalizes a scalar into an increasing zero-to-one ramp over the authored interval. */
export function rampUp01(value: number, start: number, end: number): number {
  return normalizeRange(value, start, end);
}

/** Normalizes a scalar into a decreasing one-to-zero ramp over the authored interval. */
export function rampDown01(value: number, start: number, end: number): number {
  return clamp01(1 - normalizeRange(value, start, end));
}

/** Scores a scalar against a triangular suitability window centered on the authored peak. */
export function window01(value: number, min: number, peak: number, max: number): number {
  const up = rampUp01(value, min, peak);
  const down = rampDown01(value, peak, max);
  return clamp01(up * down);
}

/** One feature claimant ranked by physical confidence, stress, and deterministic tile order. */
export type PhysicalCandidate<T extends string> = Readonly<{
  feature: T;
  confidence01: number;
  stress01: number;
  tileIndex: number;
}>;

/** Admits a finite suitability score as bounded feature confidence. */
export function confidenceFromScore01(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return clamp01(score);
}

/** Derives rejection pressure as the complement of admitted feature confidence. */
export function stressFromConfidence01(confidence01: number): number {
  return clamp01(1 - confidence01);
}

/** Orders competing feature claims by physical quality and deterministic identity tie-breaks. */
export function comparePhysicalCandidates<T extends string>(
  a: PhysicalCandidate<T>,
  b: PhysicalCandidate<T>
): number {
  if (a.confidence01 !== b.confidence01) return b.confidence01 - a.confidence01;
  if (a.stress01 !== b.stress01) return a.stress01 - b.stress01;
  if (a.tileIndex !== b.tileIndex) return a.tileIndex - b.tileIndex;
  return a.feature.localeCompare(b.feature);
}

/** Selects the strongest finite physical claimant without mutating the candidate cohort. */
export function choosePhysicalCandidate<T extends string>(
  candidates: ReadonlyArray<PhysicalCandidate<T>>
): PhysicalCandidate<T> | null {
  let best: PhysicalCandidate<T> | null = null;
  for (const candidate of candidates) {
    if (!Number.isFinite(candidate.confidence01)) continue;
    if (!Number.isFinite(candidate.stress01)) continue;
    if (best === null || comparePhysicalCandidates(candidate, best) < 0) {
      best = candidate;
    }
  }
  return best;
}
