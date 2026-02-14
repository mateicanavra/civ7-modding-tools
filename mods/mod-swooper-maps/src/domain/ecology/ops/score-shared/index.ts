import { clamp01, normalizeRange } from "@swooper/mapgen-core";

export function validateGridSize(args: Readonly<{
  width: number;
  height: number;
  fields: ReadonlyArray<Readonly<{ label: string; arr: { length: number } }>>;
}>): number {
  const width = args.width | 0;
  const height = args.height | 0;
  if (!Number.isFinite(width) || width <= 0) throw new Error("invalid width");
  if (!Number.isFinite(height) || height <= 0) throw new Error("invalid height");
  const size = width * height;

  for (const field of args.fields) {
    if (field.arr.length !== size) {
      throw new Error(`${field.label} length ${field.arr.length} != ${size}`);
    }
  }

  return size;
}

export function rampUp01(value: number, start: number, end: number): number {
  return normalizeRange(value, start, end);
}

export function rampDown01(value: number, start: number, end: number): number {
  return clamp01(1 - normalizeRange(value, start, end));
}

export function window01(value: number, min: number, peak: number, max: number): number {
  const up = rampUp01(value, min, peak);
  const down = rampDown01(value, peak, max);
  return clamp01(up * down);
}

export type PhysicalCandidate<T extends string> = Readonly<{
  feature: T;
  confidence01: number;
  stress01: number;
  tileIndex: number;
}>;

export function confidenceFromScore01(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return clamp01(score);
}

export function stressFromConfidence01(confidence01: number): number {
  return clamp01(1 - confidence01);
}

export function comparePhysicalCandidates<T extends string>(
  a: PhysicalCandidate<T>,
  b: PhysicalCandidate<T>
): number {
  if (a.confidence01 !== b.confidence01) return b.confidence01 - a.confidence01;
  if (a.stress01 !== b.stress01) return a.stress01 - b.stress01;
  if (a.tileIndex !== b.tileIndex) return a.tileIndex - b.tileIndex;
  return a.feature.localeCompare(b.feature);
}

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

export function confidenceBeatsStress(candidate: Readonly<{ confidence01: number; stress01: number }>): boolean {
  return candidate.confidence01 > candidate.stress01;
}
