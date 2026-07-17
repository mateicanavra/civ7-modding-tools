import { describe, expect, it } from "bun:test";
import {
  countMetricMask,
  evaluateMetricTargets,
  type MetricTarget,
  type MetricValue,
  measureMetricCount,
  metricShare,
  summarizeMetricComponents,
  summarizeNumericMetrics,
} from "../src/index.js";

type TestMetrics = Readonly<{ score: number; state: string }>;

describe("metric targets", () => {
  const healthy: MetricTarget<TestMetrics> = {
    id: "healthy",
    description: "The measured product retains its admitted score and state.",
    expectations: [
      {
        id: "score-floor",
        description: "The product score remains at or above its floor.",
        observe: (metrics) => metrics.score,
        comparator: { kind: "at-least", value: 3 },
      },
      {
        id: "state",
        description: "The product reaches its ready state.",
        observe: (metrics) => ({ state: metrics.state }),
        comparator: { kind: "equal", value: { state: "ready" } },
      },
    ],
  };

  it("derives pass and fail from observed values rather than caller-supplied truth", () => {
    expect(evaluateMetricTargets({ score: 3, state: "ready" }, [healthy])).toEqual([
      {
        targetId: "healthy",
        description: "The measured product retains its admitted score and state.",
        status: "pass",
        expectations: [
          {
            id: "score-floor",
            description: "The product score remains at or above its floor.",
            status: "pass",
            observed: 3,
            comparator: { kind: "at-least", value: 3 },
          },
          {
            id: "state",
            description: "The product reaches its ready state.",
            status: "pass",
            observed: { state: "ready" },
            comparator: { kind: "equal", value: { state: "ready" } },
          },
        ],
      },
    ]);
    expect(evaluateMetricTargets({ score: 2, state: "ready" }, [healthy])[0]?.status).toBe("fail");
  });

  it("evaluates multiple targets over one measured subject without owning generation", () => {
    let observations = 0;
    const target = (id: string): MetricTarget<TestMetrics> => ({
      id,
      description: `Target ${id} reads one existing product fact.`,
      expectations: [
        {
          id: "score",
          description: "The measured score is read exactly once for this target.",
          observe: (metrics) => {
            observations += 1;
            return metrics.score;
          },
          comparator: { kind: "at-most", value: 4 },
        },
      ],
    });
    expect(
      evaluateMetricTargets({ score: 4, state: "ready" }, [target("first"), target("second")])
    ).toHaveLength(2);
    expect(observations).toBe(2);
  });

  it("refuses the complete ambiguous definition graph before observing a subject", () => {
    let observations = 0;
    const observing: MetricTarget<TestMetrics> = {
      id: "observing",
      description: "A valid target that must not run before later definitions are admitted.",
      expectations: [
        {
          id: "score",
          description: "Reads one product score.",
          observe: (metrics) => {
            observations += 1;
            return metrics.score;
          },
          comparator: { kind: "at-least", value: 0 },
        },
      ],
    };
    const invalid = {
      id: "invalid",
      description: "The malformed target is rejected before evaluation.",
      expectations: [
        {
          id: "score",
          description: "Uses no admitted comparator.",
          observe: (metrics: TestMetrics) => metrics.score,
          comparator: { kind: "between", value: 3 },
        },
      ],
    } as unknown as MetricTarget<TestMetrics>;

    expect(() => evaluateMetricTargets({ score: 3, state: "ready" }, [observing, invalid])).toThrow(
      "uses unknown comparator between"
    );
    expect(observations).toBe(0);
    expect(() => evaluateMetricTargets({ score: 3, state: "ready" }, [] as never)).toThrow(
      "At least one metric target"
    );
    expect(() => evaluateMetricTargets({ score: 3, state: "ready" }, [healthy, healthy])).toThrow(
      'Duplicate metric target ID "healthy"'
    );
  });

  it("refuses non-finite and type-incompatible ordered observations", () => {
    expect(() =>
      evaluateMetricTargets({ score: Number.NaN, state: "ready" }, [
        {
          id: "finite",
          description: "Only finite observations enter target evaluation.",
          expectations: [
            {
              id: "score",
              description: "The score is finite.",
              observe: (metrics) => metrics.score,
              comparator: { kind: "at-least", value: 0 },
            },
          ],
        },
      ])
    ).toThrow("requires a finite numeric observation");

    const invalidObserver = {
      id: "numeric-shape",
      description: "Ordered comparison requires numeric evidence.",
      expectations: [
        {
          id: "score",
          description: "The score is numeric.",
          observe: (metrics: TestMetrics) => metrics.state,
          comparator: { kind: "at-least", value: 0 },
        },
      ],
    } as unknown as MetricTarget<TestMetrics>;
    expect(() => evaluateMetricTargets({ score: 3, state: "ready" }, [invalidObserver])).toThrow(
      "requires a finite numeric observation"
    );
  });

  it("snapshots retained evidence so later mutation cannot contradict status", () => {
    const observed = { state: "ready" };
    const expected = { state: "ready" };
    const evaluation = evaluateMetricTargets(observed, [
      {
        id: "stable-evidence",
        description: "A closed evaluation retains the values it actually compared.",
        expectations: [
          {
            id: "state",
            description: "The state remains ready.",
            observe: (value) => value,
            comparator: { kind: "equal", value: expected },
          },
        ],
      },
    ]);
    observed.state = "changed";
    expected.state = "changed";
    expect(evaluation[0]?.status).toBe("pass");
    expect(evaluation[0]?.expectations[0]?.observed).toEqual({ state: "ready" });
    expect(Object.isFrozen(evaluation[0]?.expectations[0]?.observed)).toBe(true);
  });

  it("retains hostile JSON keys as evidence rather than mutating record prototypes", () => {
    const observed = JSON.parse('{"__proto__":{"state":"changed"}}') as Record<string, unknown>;
    const expected = JSON.parse('{"__proto__":{"state":"ready"}}') as Record<string, unknown>;
    const evaluation = evaluateMetricTargets(observed, [
      {
        id: "hostile-json-key",
        description: "JSON record keys remain ordinary evidence during comparison.",
        expectations: [
          {
            id: "record",
            description: "Different nested evidence does not compare equal.",
            observe: (value) => value as MetricValue,
            comparator: { kind: "equal", value: expected as MetricValue },
          },
        ],
      },
    ]);
    expect(evaluation[0]?.status).toBe("fail");
    expect(Object.hasOwn(evaluation[0]?.expectations[0]?.observed as object, "__proto__")).toBe(
      true
    );
  });
});

describe("metric measurements", () => {
  it("summarizes finite nonempty observations without overflowing the mean", () => {
    expect(summarizeNumericMetrics([1, 2, 6])).toEqual({
      count: 3,
      minimum: 1,
      maximum: 6,
      mean: 3,
    });
    expect(summarizeNumericMetrics([Number.MAX_VALUE, Number.MAX_VALUE]).mean).toBe(
      Number.MAX_VALUE
    );
    expect(() => summarizeNumericMetrics([] as never)).toThrow("requires an observation");
    expect(() => summarizeNumericMetrics([Number.POSITIVE_INFINITY])).toThrow("must be finite");
  });

  it("preserves empty population rather than presenting false zero share", () => {
    expect(metricShare(measureMetricCount(0, 0))).toBeNull();
    expect(metricShare(measureMetricCount(2, 4))).toBe(0.5);
    expect(() => measureMetricCount(2, 1)).toThrow("cannot exceed");
    expect(() => measureMetricCount(0.5, 1)).toThrow("safe integer");
    expect(countMetricMask(Uint8Array.from([]))).toEqual({ count: 0, population: 0 });
    expect(countMetricMask(Uint8Array.from([1, 0, 1]))).toEqual({
      count: 2,
      population: 3,
    });
    expect(() => countMetricMask({ length: Number.POSITIVE_INFINITY })).toThrow("safe integer");
    expect(() => countMetricMask(Uint8Array.from([2]))).toThrow("only 0 or 1");
  });

  it("summarizes authoritative component rows without duplicating topology", () => {
    expect(summarizeMetricComponents([])).toEqual({
      componentCount: 0,
      largestComponentSize: 0,
      maximumComponentDiameter: 0,
      singleTileComponentCount: 0,
    });
    expect(
      summarizeMetricComponents([
        { size: 1, diameter: 0 },
        { size: 7, diameter: 4 },
        { size: 3, diameter: 2 },
      ])
    ).toEqual({
      componentCount: 3,
      largestComponentSize: 7,
      maximumComponentDiameter: 4,
      singleTileComponentCount: 1,
    });
    expect(() => summarizeMetricComponents([{ size: 1, diameter: 4 }])).toThrow(
      "cannot exceed size minus one"
    );
  });
});
