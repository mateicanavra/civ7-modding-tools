/** One numeric grid submitted to the comparator, which owns its shape and cardinality admission. */
export type ExactNumericGrid = Readonly<{
  width: number;
  height: number;
  values: ReadonlyArray<number | null>;
}>;

/** One bounded cell witness from a complete exact-grid comparison. */
export type ExactNumericGridMismatch = Readonly<{
  x: number;
  y: number;
  expected: number | null;
  observed: number | null;
  reason: "value-mismatch" | "missing-observation";
}>;

/** Frequency of one expected/observed pair among the mismatched cells. */
export type ExactNumericGridValuePair = Readonly<{
  expected: number | null;
  observed: number | null;
  count: number;
}>;

/**
 * Closed evidence result for exact numeric-grid comparison.
 * Incompatible evidence is never presented as a complete mismatch, while complete evidence
 * distinguishes exact agreement from disagreement and keeps missing observations explicit.
 */
export type ExactNumericGridComparison =
  | Readonly<{
      outcome: "incompatible";
      reason:
        | "invalid-expected-dimensions"
        | "invalid-observed-dimensions"
        | "dimension-mismatch"
        | "expected-cardinality-mismatch"
        | "observed-cardinality-mismatch";
      expected: Readonly<{ width: number; height: number; cardinality: number }>;
      observed: Readonly<{ width: number; height: number; cardinality: number }>;
    }>
  | Readonly<{
      outcome: "match" | "mismatch";
      compared: number;
      missingObserved: number;
      mismatches: number;
      mismatchRatio: number;
      examples: ReadonlyArray<ExactNumericGridMismatch>;
      pairCounts: ReadonlyArray<ExactNumericGridValuePair>;
    }>;

type PairCount = ExactNumericGridValuePair & Readonly<{ firstIndex: number }>;

function admittedBound(value: number | undefined, fallback: number, label: string): number {
  const resolved = value ?? fallback;
  if (!Number.isSafeInteger(resolved) || resolved < 0) {
    throw new RangeError(`${label} must be a nonnegative safe integer.`);
  }
  return resolved;
}

function hasValidDimensions(grid: ExactNumericGrid): boolean {
  return (
    Number.isSafeInteger(grid.width) &&
    grid.width > 0 &&
    Number.isSafeInteger(grid.height) &&
    grid.height > 0 &&
    Number.isSafeInteger(grid.width * grid.height)
  );
}

function evidenceShape(grid: ExactNumericGrid): Readonly<{
  width: number;
  height: number;
  cardinality: number;
}> {
  return { width: grid.width, height: grid.height, cardinality: grid.values.length };
}

function incompatible(
  reason: Extract<ExactNumericGridComparison, { outcome: "incompatible" }>["reason"],
  expected: ExactNumericGrid,
  observed: ExactNumericGrid
): ExactNumericGridComparison {
  return {
    outcome: "incompatible",
    reason,
    expected: evidenceShape(expected),
    observed: evidenceShape(observed),
  };
}

function pairKey(expected: number | null, observed: number | null): string {
  return `${expected === null ? "null" : expected}:${observed === null ? "null" : observed}`;
}

/**
 * Compares two complete rectangular grids cell-for-cell without applying product acceptance policy.
 * Shape and cardinality are admitted before any cell is read; invalid bounds are rejected as API
 * misuse, and bounded examples and pair counts retain deterministic first-observation ordering.
 */
export function compareExactNumericGrids(
  expected: ExactNumericGrid,
  observed: ExactNumericGrid,
  options: Readonly<{ maxExamples?: number; maxPairs?: number }> = {}
): ExactNumericGridComparison {
  const maxExamples = admittedBound(options.maxExamples, 16, "maxExamples");
  const maxPairs = admittedBound(options.maxPairs, 24, "maxPairs");

  if (!hasValidDimensions(expected)) {
    return incompatible("invalid-expected-dimensions", expected, observed);
  }
  if (!hasValidDimensions(observed)) {
    return incompatible("invalid-observed-dimensions", expected, observed);
  }
  if (expected.width !== observed.width || expected.height !== observed.height) {
    return incompatible("dimension-mismatch", expected, observed);
  }

  const cardinality = expected.width * expected.height;
  if (expected.values.length !== cardinality) {
    return incompatible("expected-cardinality-mismatch", expected, observed);
  }
  if (observed.values.length !== cardinality) {
    return incompatible("observed-cardinality-mismatch", expected, observed);
  }

  let missingObserved = 0;
  let mismatches = 0;
  const examples: ExactNumericGridMismatch[] = [];
  const pairsByValue = new Map<string, PairCount>();

  for (let index = 0; index < cardinality; index += 1) {
    const expectedValue = expected.values[index] ?? null;
    const observedValue = observed.values[index] ?? null;
    if (observedValue === null) missingObserved += 1;
    if (expectedValue === observedValue) continue;

    mismatches += 1;
    const key = pairKey(expectedValue, observedValue);
    const pair = pairsByValue.get(key);
    if (pair) {
      pairsByValue.set(key, { ...pair, count: pair.count + 1 });
    } else {
      pairsByValue.set(key, {
        expected: expectedValue,
        observed: observedValue,
        count: 1,
        firstIndex: index,
      });
    }

    if (examples.length < maxExamples) {
      const y = Math.floor(index / expected.width);
      examples.push({
        x: index - y * expected.width,
        y,
        expected: expectedValue,
        observed: observedValue,
        reason: observedValue === null ? "missing-observation" : "value-mismatch",
      });
    }
  }

  const pairCounts = [...pairsByValue.values()]
    .sort((left, right) => right.count - left.count || left.firstIndex - right.firstIndex)
    .slice(0, maxPairs)
    .map(({ expected: expectedValue, observed: observedValue, count }) => ({
      expected: expectedValue,
      observed: observedValue,
      count,
    }));

  return {
    outcome: mismatches === 0 ? "match" : "mismatch",
    compared: cardinality,
    missingObserved,
    mismatches,
    mismatchRatio: mismatches / cardinality,
    examples,
    pairCounts,
  };
}
