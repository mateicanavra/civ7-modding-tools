import type { NonEmptyTuple } from "type-fest";

/** Deterministic scalar summary for one nonempty set of finite observations. */
export type NumericMetricSummary = Readonly<{
  count: number;
  minimum: number;
  maximum: number;
  mean: number;
}>;

/** A measured share that retains the population needed to interpret its value. */
export type CountMetric = Readonly<{
  count: number;
  population: number;
}>;

/**
 * Summarizes a nonempty collection of finite observations without product judgment.
 * Empty and non-finite inputs are refused so missing evidence cannot become a metric.
 */
export function summarizeNumericMetrics(values: NonEmptyTuple<number>): NumericMetricSummary {
  if (values.length === 0) throw new Error("A numeric metric summary requires an observation.");

  let minimum = Number.POSITIVE_INFINITY;
  let maximum = Number.NEGATIVE_INFINITY;
  let mean = 0;
  for (const [index, value] of values.entries()) {
    assertFiniteMetric(value, "Metric observations");
    minimum = Math.min(minimum, value);
    maximum = Math.max(maximum, value);
    const count = index + 1;
    mean = mean * ((count - 1) / count) + value / count;
    assertFiniteMetric(mean, "The metric mean");
  }
  return Object.freeze({
    count: values.length,
    minimum,
    maximum,
    mean,
  });
}

/**
 * Admits one count and the population against which it is interpreted.
 * Safe-integer enforcement keeps this discrete evidence distinct from weighted quantities.
 */
export function measureMetricCount(count: number, population: number): CountMetric {
  assertCount(count, "A metric count");
  assertCount(population, "A metric population");
  if (count > population) throw new Error("A metric count cannot exceed its population.");
  return Object.freeze({ count, population });
}

/**
 * Projects a retained count into a share without inventing a value for an empty population.
 * The count remains the authority; this derived scalar is `null` when no population exists.
 */
export function metricShare(metric: CountMetric): number | null {
  const admitted = measureMetricCount(metric.count, metric.population);
  return admitted.population === 0 ? null : admitted.count / admitted.population;
}

/**
 * Counts a canonical binary mask and retains both coverage and population evidence.
 * Values other than `0` and `1` are refused instead of being silently treated as truthy.
 */
export function countMetricMask(mask: ArrayLike<number>): CountMetric {
  const population = mask.length;
  assertCount(population, "A metric mask population");
  let selected = 0;
  for (let index = 0; index < population; index += 1) {
    const value = mask[index];
    if (value !== 0 && value !== 1) {
      throw new Error(`Metric masks must contain only 0 or 1; received ${String(value)}.`);
    }
    selected += value;
  }
  return measureMetricCount(selected, population);
}

function assertFiniteMetric(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${label} must be finite; received ${String(value)}.`);
  }
}

function assertCount(value: number, label: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${label} must be a nonnegative safe integer; received ${String(value)}.`);
  }
}
