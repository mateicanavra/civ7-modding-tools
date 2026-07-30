import {
  type CountMetric,
  type MetricExpectation,
  type MetricValue,
  metricShare,
  type NumericMetricSummary,
  summarizeNumericMetrics,
} from "@swooper/mapgen-metrics";
import type { NonEmptyTuple } from "type-fest";

/**
 * Declares an inclusive product floor while leaving observation and evaluation separate.
 * Keeping comparison law as data lets cases reuse the same target in tests and reports.
 */
export function atLeast<T>(
  id: string,
  description: string,
  observe: (subject: T) => number,
  value: number
): MetricExpectation<T> {
  return { id, description, observe, comparator: { kind: "at-least", value } };
}

/**
 * Declares an inclusive product ceiling while leaving observation and evaluation separate.
 * The engine retains the comparator so a failed report can explain the expected boundary.
 */
export function atMost<T>(
  id: string,
  description: string,
  observe: (subject: T) => number,
  value: number
): MetricExpectation<T> {
  return { id, description, observe, comparator: { kind: "at-most", value } };
}

/**
 * Declares an exact structural product expectation for boolean, scalar, or record evidence.
 * Use this for relationships and closure laws that are categorical rather than ordered.
 */
export function equalTo<T>(
  id: string,
  description: string,
  observe: (subject: T) => MetricValue,
  value: MetricValue
): MetricExpectation<T> {
  return { id, description, observe, comparator: { kind: "equal", value } };
}

/**
 * Projects a measured count into a required share for a product target.
 * An empty population is missing evidence, not a zero-valued observation, so it is refused.
 */
export function requiredShare(metric: CountMetric, label: string): number {
  const share = metricShare(metric);
  if (share === null) throw new Error(`${label} requires a nonempty measured population.`);
  return share;
}

/**
 * Projects two retained counts into a ratio while refusing an absent denominator.
 * This is used when the numerator and denominator belong to different metric families and
 * therefore cannot honestly be represented as one `CountMetric` during measurement.
 */
export function requiredRatio(numerator: number, denominator: number, label: string): number {
  if (!Number.isSafeInteger(numerator) || numerator < 0) {
    throw new Error(`${label} requires a nonnegative integer numerator.`);
  }
  if (!Number.isSafeInteger(denominator) || denominator <= 0) {
    throw new Error(`${label} requires a positive integer denominator.`);
  }
  return numerator / denominator;
}

/**
 * Summarizes one scalar observation from every member of a nonempty product cohort.
 * Target modules use its minimum or maximum to express an every-scenario law without
 * duplicating evaluation loops or losing the cohort's observed range.
 */
export function summarizeCohort<T>(
  subjects: NonEmptyTuple<T>,
  observe: (subject: T) => number
): NumericMetricSummary {
  const [first, ...rest] = subjects;
  return summarizeNumericMetrics([observe(first), ...rest.map(observe)]);
}
