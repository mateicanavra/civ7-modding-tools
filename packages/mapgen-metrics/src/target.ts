import type { NonEmptyTuple } from "type-fest";

const MAX_METRIC_VALUE_DEPTH = 64;

/** JSON-safe value retained with a product-target expectation. */
export type MetricValue =
  | null
  | boolean
  | number
  | string
  | readonly MetricValue[]
  | Readonly<{ [key: string]: MetricValue }>;

/** Closed comparison law for values that can be compared structurally. */
export type EqualMetricComparator = Readonly<{ kind: "equal"; value: MetricValue }>;

/** Closed comparison law for ordered finite numeric facts. */
export type NumericMetricComparator =
  | Readonly<{ kind: "at-least"; value: number }>
  | Readonly<{ kind: "at-most"; value: number }>;

/** Comparison law retained in target results for human and machine projection. */
export type MetricComparator = EqualMetricComparator | NumericMetricComparator;

type MetricExpectationBase = Readonly<{
  id: string;
  description: string;
}>;

/**
 * One semantic product expectation over an already-measured subject.
 * Its discriminated comparator couples ordered comparisons to numeric observations.
 */
export type MetricExpectation<TSubject> =
  | (MetricExpectationBase &
      Readonly<{
        observe: (subject: TSubject) => MetricValue;
        comparator: EqualMetricComparator;
      }>)
  | (MetricExpectationBase &
      Readonly<{
        observe: (subject: TSubject) => number;
        comparator: NumericMetricComparator;
      }>);

/** A named nonempty set of expectations that defines one product benchmark. */
export type MetricTarget<TSubject> = Readonly<{
  id: string;
  description: string;
  expectations: NonEmptyTuple<MetricExpectation<TSubject>>;
}>;

/** Closed result of comparing one immutable observation with its declared expectation. */
export type MetricExpectationResult = Readonly<{
  id: string;
  description: string;
  status: "pass" | "fail";
  observed: MetricValue;
  comparator: MetricComparator;
}>;

/** Aggregate pass/fail result for one product target and its ordered expectations. */
export type MetricTargetEvaluation = Readonly<{
  targetId: string;
  description: string;
  status: "pass" | "fail";
  expectations: readonly MetricExpectationResult[];
}>;

type PreparedExpectation<TSubject> = Readonly<{
  id: string;
  description: string;
  observe: (subject: TSubject) => unknown;
  comparator: MetricComparator;
}>;

type PreparedTarget<TSubject> = Readonly<{
  id: string;
  description: string;
  expectations: readonly PreparedExpectation<TSubject>[];
}>;

/**
 * Evaluates named targets against one already-measured subject in declaration order.
 * The complete definition graph is admitted before observation, and retained values are
 * recursively snapshotted so a result's status cannot drift from its evidence later.
 */
export function evaluateMetricTargets<TSubject>(
  subject: TSubject,
  targets: NonEmptyTuple<MetricTarget<TSubject>>
): readonly MetricTargetEvaluation[] {
  const preparedTargets = prepareTargets(targets);
  const evaluations = preparedTargets.map((target): MetricTargetEvaluation => {
    const expectations = Object.freeze(
      target.expectations.map((expectation) => evaluateExpectation(subject, expectation))
    );
    return Object.freeze({
      targetId: target.id,
      description: target.description,
      status: expectations.every((expectation) => expectation.status === "pass") ? "pass" : "fail",
      expectations,
    });
  });
  return Object.freeze(evaluations);
}

function prepareTargets<TSubject>(
  targets: readonly MetricTarget<TSubject>[]
): readonly PreparedTarget<TSubject>[] {
  if (targets.length === 0) throw new Error("At least one metric target is required.");
  assertUniqueIds(
    targets.map((target) => target.id),
    "metric target"
  );

  return Object.freeze(
    targets.map((target): PreparedTarget<TSubject> => {
      assertDescription(target.description, `Metric target "${target.id}"`);
      if (target.expectations.length === 0) {
        throw new Error(`Metric target "${target.id}" requires at least one expectation.`);
      }
      assertUniqueIds(
        target.expectations.map((expectation) => expectation.id),
        `expectation in metric target "${target.id}"`
      );
      const expectations = Object.freeze(
        target.expectations.map((expectation): PreparedExpectation<TSubject> => {
          assertDescription(expectation.description, `Metric expectation "${expectation.id}"`);
          if (typeof expectation.observe !== "function") {
            throw new Error(`Metric expectation "${expectation.id}" requires an observer.`);
          }
          return Object.freeze({
            id: expectation.id,
            description: expectation.description,
            observe: expectation.observe as (subject: TSubject) => unknown,
            comparator: prepareComparator(expectation.id, expectation.comparator),
          });
        })
      );
      return Object.freeze({ id: target.id, description: target.description, expectations });
    })
  );
}

function prepareComparator(expectationId: string, value: unknown): MetricComparator {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`Metric expectation "${expectationId}" requires a comparator record.`);
  }
  const comparator = value as Readonly<{ kind?: unknown; value?: unknown }>;
  switch (comparator.kind) {
    case "equal":
      return Object.freeze({
        kind: "equal",
        value: snapshotMetricValue(comparator.value, "Expected metric value"),
      });
    case "at-least":
    case "at-most":
      if (typeof comparator.value !== "number" || !Number.isFinite(comparator.value)) {
        throw new Error(
          `Metric expectation "${expectationId}" requires a finite numeric comparator value.`
        );
      }
      return Object.freeze({ kind: comparator.kind, value: comparator.value });
    default:
      throw new Error(
        `Metric expectation "${expectationId}" uses unknown comparator ${String(comparator.kind)}.`
      );
  }
}

function evaluateExpectation<TSubject>(
  subject: TSubject,
  expectation: PreparedExpectation<TSubject>
): MetricExpectationResult {
  const observed = expectation.observe(subject);
  switch (expectation.comparator.kind) {
    case "equal": {
      const observedSnapshot = snapshotMetricValue(observed, "Observed metric value");
      return Object.freeze({
        id: expectation.id,
        description: expectation.description,
        status: metricValuesEqual(observedSnapshot, expectation.comparator.value) ? "pass" : "fail",
        observed: observedSnapshot,
        comparator: expectation.comparator,
      });
    }
    case "at-least":
    case "at-most": {
      if (typeof observed !== "number" || !Number.isFinite(observed)) {
        throw new Error(
          `Metric expectation "${expectation.id}" requires a finite numeric observation.`
        );
      }
      const passed =
        expectation.comparator.kind === "at-least"
          ? observed >= expectation.comparator.value
          : observed <= expectation.comparator.value;
      return Object.freeze({
        id: expectation.id,
        description: expectation.description,
        status: passed ? "pass" : "fail",
        observed,
        comparator: expectation.comparator,
      });
    }
  }
}

function snapshotMetricValue(
  value: unknown,
  label: string,
  ancestors = new Set<object>(),
  depth = 0
): MetricValue {
  if (depth > MAX_METRIC_VALUE_DEPTH) {
    throw new Error(`${label} exceeds the supported nesting depth.`);
  }
  if (value === null || typeof value === "boolean" || typeof value === "string") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error(`${label} must contain only finite numbers; received ${String(value)}.`);
    }
    return value;
  }
  if (typeof value !== "object") throw new Error(`${label} must be JSON-safe.`);
  if (ancestors.has(value)) throw new Error(`${label} must not contain cycles.`);
  ancestors.add(value);

  let snapshot: MetricValue;
  if (Array.isArray(value)) {
    const items: MetricValue[] = [];
    for (let index = 0; index < value.length; index += 1) {
      if (!(index in value)) throw new Error(`${label} must not contain sparse arrays.`);
      items.push(snapshotMetricValue(value[index], label, ancestors, depth + 1));
    }
    snapshot = Object.freeze(items);
  } else {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new Error(`${label} must contain only plain records.`);
    }
    const ownKeys = Reflect.ownKeys(value);
    if (ownKeys.some((key) => typeof key !== "string")) {
      throw new Error(`${label} must contain only string-keyed records.`);
    }
    const record: Record<string, MetricValue> = {};
    for (const key of (ownKeys as string[]).sort()) {
      Object.defineProperty(record, key, {
        value: snapshotMetricValue(
          (value as Readonly<Record<string, unknown>>)[key],
          label,
          ancestors,
          depth + 1
        ),
        enumerable: true,
        configurable: false,
        writable: false,
      });
    }
    snapshot = Object.freeze(record);
  }
  ancestors.delete(value);
  return snapshot;
}

function metricValuesEqual(left: MetricValue, right: MetricValue): boolean {
  if (left === right) return true;
  if (Array.isArray(left) || Array.isArray(right)) {
    return (
      Array.isArray(left) &&
      Array.isArray(right) &&
      left.length === right.length &&
      left.every((value, index) => metricValuesEqual(value, right[index]!))
    );
  }
  if (isMetricRecord(left) && isMetricRecord(right)) {
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);
    return (
      leftKeys.length === rightKeys.length &&
      leftKeys.every(
        (key, index) => key === rightKeys[index] && metricValuesEqual(left[key]!, right[key]!)
      )
    );
  }
  return false;
}

function isMetricRecord(value: MetricValue): value is Readonly<Record<string, MetricValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertUniqueIds(ids: readonly string[], label: string): void {
  const observed = new Set<string>();
  for (const id of ids) {
    if (id.trim().length === 0) throw new Error(`A ${label} ID must not be empty.`);
    if (id !== id.trim()) throw new Error(`A ${label} ID must not contain outer whitespace.`);
    if (observed.has(id)) throw new Error(`Duplicate ${label} ID "${id}".`);
    observed.add(id);
  }
}

function assertDescription(description: string, label: string): void {
  if (description.trim().length === 0) throw new Error(`${label} requires a description.`);
}
