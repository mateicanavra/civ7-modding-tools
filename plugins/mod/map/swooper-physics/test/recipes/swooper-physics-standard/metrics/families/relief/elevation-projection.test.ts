import { describe, expect, it } from "bun:test";
import { Value } from "typebox/value";
import {
  measureStandardElevationProjection,
  StandardElevationProjectionMeasurementsSchema,
} from "../../../../../../src/recipes/standard/metrics/families/elevation-projection.js";

describe("exact elevation projection measurements", () => {
  it("retains fractional native disagreement that an Int16 snapshot would hide", () => {
    const result = measureStandardElevationProjection({
      phase: "post-write",
      intended: [0, 1, 2, 3, 4, 5],
      snapshot: {
        source: "native",
        status: "available",
        width: 3,
        height: 2,
        values: Float64Array.of(0, 1, 2.25, 3, 4, 5),
      },
    });
    expect(result).toMatchObject({
      source: "native",
      status: "observed",
      mismatchCount: 1,
      lakeAdjustmentCount: 0,
      unplannedNativeLakeMismatchCount: 0,
      nonLakeMismatchCount: 1,
      maximumAbsoluteError: 0.25,
      examples: [{ plotIndex: 2, intended: 2, observed: 2.25 }],
    });
    expect(Value.Check(StandardElevationProjectionMeasurementsSchema, result)).toBe(true);
  });

  it("does not label mock storage agreement as native proof", () => {
    const result = measureStandardElevationProjection({
      phase: "final",
      intended: [0, 1550],
      snapshot: {
        source: "mock",
        status: "available",
        width: 2,
        height: 1,
        values: Float64Array.of(0, 1550),
      },
    });
    expect(result).toMatchObject({ source: "mock", status: "mock-only", mismatchCount: 0 });
    expect(Value.Check(StandardElevationProjectionMeasurementsSchema, result)).toBe(true);
  });

  it("keeps unavailable and non-finite reads out of the comparison channel", () => {
    const input = { phase: "final" as const, intended: [20, 30] };
    expect(
      measureStandardElevationProjection({
        ...input,
        snapshot: {
          source: "native",
          width: 2,
          height: 1,
          status: "unavailable",
          reason: "read-failed",
          plotIndex: 1,
        },
      })
    ).toMatchObject({ status: "unavailable", reason: "read-failed", plotIndex: 1 });
    expect(
      measureStandardElevationProjection({
        ...input,
        snapshot: {
          source: "native",
          width: 2,
          height: 1,
          status: "available",
          values: Float64Array.of(20, NaN),
        },
      })
    ).toMatchObject({ status: "unavailable", reason: "non-finite-value", plotIndex: 1 });
  });

  it("rejects mismatched map cardinality", () => {
    expect(() =>
      measureStandardElevationProjection({
        phase: "final",
        intended: [1],
        snapshot: {
          source: "native",
          width: 2,
          height: 1,
          status: "available",
          values: Float64Array.of(1, 2),
        },
      })
    ).toThrow("every map plot");
    expect(() =>
      measureStandardElevationProjection({
        phase: "final",
        intended: [1, 2],
        snapshot: {
          source: "native",
          width: 2,
          height: 1,
          status: "available",
          values: Float64Array.of(1),
        },
      })
    ).toThrow("observation cardinality");
  });

  it("reports exact extrema, counts and arithmetic mean without a tolerance", () => {
    const result = measureStandardElevationProjection({
      phase: "post-write",
      intended: [-2, 0, 1.25, 1550],
      snapshot: {
        source: "native",
        status: "available",
        width: 2,
        height: 2,
        values: Float64Array.of(-1.5, 0, 1, 1549),
      },
    });
    expect(result).toEqual({
      version: 1,
      phase: "post-write",
      source: "native",
      status: "observed",
      plotCount: 4,
      intendedMinimum: -2,
      intendedMaximum: 1550,
      observedMinimum: -1.5,
      observedMaximum: 1549,
      mismatchCount: 3,
      lakeAdjustmentCount: 0,
      unplannedNativeLakeMismatchCount: 0,
      nonLakeMismatchCount: 3,
      maximumAbsoluteError: 1,
      meanAbsoluteError: 0.4375,
      examples: [
        { plotIndex: 0, intended: -2, observed: -1.5 },
        { plotIndex: 2, intended: 1.25, observed: 1 },
        { plotIndex: 3, intended: 1550, observed: 1549 },
      ],
    });
    expect(Value.Check(StandardElevationProjectionMeasurementsSchema, result)).toBe(true);
  });

  it("caps examples without capping the full-map disagreement count", () => {
    const result = measureStandardElevationProjection({
      phase: "final",
      intended: new Array<number>(12).fill(0),
      snapshot: {
        source: "native",
        status: "available",
        width: 4,
        height: 3,
        values: new Float64Array(12).fill(0.125),
      },
    });
    if (result.status !== "observed") throw new Error("Expected native observation.");
    expect(result.mismatchCount).toBe(12);
    expect(result.examples.map(({ plotIndex }) => plotIndex)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(result.meanAbsoluteError).toBe(0.125);
    expect(Value.Check(StandardElevationProjectionMeasurementsSchema, result)).toBe(true);
  });

  it("distinguishes accepted-lake adjustments from other drift without normalizing observations", () => {
    const result = measureStandardElevationProjection({
      phase: "post-write",
      intended: [0, 200, 300, 400, 500, 600],
      acceptedLakeMask: Uint8Array.of(0, 1, 1, 0, 0, 0),
      snapshot: {
        source: "native",
        status: "available",
        width: 3,
        height: 2,
        values: Float64Array.of(0, 128, 128, 350, 500, 600),
      },
    });
    expect(result).toMatchObject({
      mismatchCount: 3,
      lakeAdjustmentCount: 2,
      unplannedNativeLakeMismatchCount: 0,
      nonLakeMismatchCount: 1,
      maximumAbsoluteError: 172,
      meanAbsoluteError: 49,
      examples: [
        { plotIndex: 1, intended: 200, observed: 128 },
        { plotIndex: 2, intended: 300, observed: 128 },
        { plotIndex: 3, intended: 400, observed: 350 },
      ],
    });
    expect(Value.Check(StandardElevationProjectionMeasurementsSchema, result)).toBe(true);
  });

  it.each([
    "post-write",
    "final",
  ] as const)("classifies current native lakes separately in %s without hiding any raw error", (phase) => {
    const input = {
      phase,
      intended: [0, 200, 300, 400, 500, 600],
      acceptedLakeMask: Uint8Array.of(0, 1, 1, 0, 0, 0),
      snapshot: {
        source: "native" as const,
        status: "available" as const,
        width: 3,
        height: 2,
        values: Float64Array.of(10, 128, 128, 350, 500, 600),
      },
    };
    const observedLakeMask = Uint8Array.of(1, 1, 0, 0, 1, 0);
    const result = measureStandardElevationProjection({ ...input, observedLakeMask });
    const withoutLakeEvidence = measureStandardElevationProjection(input);
    if (result.status !== "observed" || withoutLakeEvidence.status !== "observed") {
      throw new Error("Expected native observations.");
    }
    expect(result).toMatchObject({
      mismatchCount: 4,
      lakeAdjustmentCount: 2,
      unplannedNativeLakeMismatchCount: 1,
      nonLakeMismatchCount: 1,
      maximumAbsoluteError: 172,
      meanAbsoluteError: 304 / 6,
      examples: [
        { plotIndex: 0, intended: 0, observed: 10 },
        { plotIndex: 1, intended: 200, observed: 128 },
        { plotIndex: 2, intended: 300, observed: 128 },
        { plotIndex: 3, intended: 400, observed: 350 },
      ],
    });
    expect(
      result.lakeAdjustmentCount +
        result.unplannedNativeLakeMismatchCount +
        result.nonLakeMismatchCount
    ).toBe(result.mismatchCount);
    expect(result).toEqual({
      ...withoutLakeEvidence,
      unplannedNativeLakeMismatchCount: 1,
      nonLakeMismatchCount: 1,
    });
    expect(withoutLakeEvidence.unplannedNativeLakeMismatchCount).toBe(0);
    expect(withoutLakeEvidence.nonLakeMismatchCount).toBe(2);
    expect(Array.from(input.acceptedLakeMask)).toEqual([0, 1, 1, 0, 0, 0]);
    expect(Array.from(observedLakeMask)).toEqual([1, 1, 0, 0, 1, 0]);
    expect(Array.from(input.snapshot.values)).toEqual([10, 128, 128, 350, 500, 600]);
    expect(Value.Check(StandardElevationProjectionMeasurementsSchema, result)).toBe(true);
  });

  it("does not count unchanged authored or observed lakes as adjustments", () => {
    const result = measureStandardElevationProjection({
      phase: "final",
      intended: [200, 300],
      acceptedLakeMask: { 0: 1, 1: 0, length: 2 },
      observedLakeMask: { 0: 1, 1: 1, length: 2 },
      snapshot: {
        source: "mock",
        status: "available",
        width: 2,
        height: 1,
        values: Float64Array.of(200, 300),
      },
    });
    expect(result).toMatchObject({
      status: "mock-only",
      mismatchCount: 0,
      lakeAdjustmentCount: 0,
      unplannedNativeLakeMismatchCount: 0,
      nonLakeMismatchCount: 0,
    });
  });

  it.each([
    "available",
    "unavailable",
  ] as const)("rejects wrong-sized or ambiguous observed lake masks with %s numeric evidence", (status) => {
    const input = {
      phase: "final" as const,
      intended: [200, 300],
      snapshot: {
        source: "native" as const,
        width: 2,
        height: 1,
        ...(status === "available"
          ? { status, values: Float64Array.of(200, 300) }
          : { status, reason: "read-failed" as const }),
      },
    };
    expect(() => measureStandardElevationProjection({ ...input, observedLakeMask: [1] })).toThrow(
      "Observed lake mask cardinality"
    );
    for (const observedLakeMask of [[0, 2], [0, NaN], new Array<number>(2)]) {
      expect(() => measureStandardElevationProjection({ ...input, observedLakeMask })).toThrow(
        "Observed lake mask requires zero or one"
      );
    }
  });

  it("rejects wrong-sized or ambiguous accepted lake masks", () => {
    const input = {
      phase: "final" as const,
      intended: [200, 300],
      snapshot: {
        source: "native" as const,
        status: "available" as const,
        width: 2,
        height: 1,
        values: Float64Array.of(200, 300),
      },
    };
    expect(() => measureStandardElevationProjection({ ...input, acceptedLakeMask: [1] })).toThrow(
      "lake mask cardinality"
    );
    expect(() =>
      measureStandardElevationProjection({ ...input, acceptedLakeMask: [0, 2] })
    ).toThrow("zero or one");
    expect(() =>
      measureStandardElevationProjection({ ...input, acceptedLakeMask: new Array<number>(2) })
    ).toThrow("zero or one");
  });

  it.each([
    "native",
    "mock",
  ] as const)("keeps unavailable %s observations schema-valid and without error statistics", (source) => {
    for (const reason of ["getter-unavailable", "read-failed", "non-finite-value"] as const) {
      const result = measureStandardElevationProjection({
        phase: "final",
        intended: [0, 20],
        snapshot: { source, status: "unavailable", width: 2, height: 1, reason, plotIndex: 1 },
      });
      expect(Value.Check(StandardElevationProjectionMeasurementsSchema, result)).toBe(true);
      expect("mismatchCount" in result).toBe(false);
      expect("maximumAbsoluteError" in result).toBe(false);
      expect("lakeAdjustmentCount" in result).toBe(false);
      expect("unplannedNativeLakeMismatchCount" in result).toBe(false);
      expect("nonLakeMismatchCount" in result).toBe(false);
    }
  });

  it.each([
    [Number.NaN, 2],
    [1.5, 2],
    [2, 1.5],
    [0, 2],
    [-1, -2],
    [Number.POSITIVE_INFINITY, 2],
    [Number.MAX_SAFE_INTEGER + 1, 1],
    [Number.MAX_SAFE_INTEGER, 2],
  ])("rejects invalid dimensions %s x %s", (width, height) => {
    expect(() =>
      measureStandardElevationProjection({
        phase: "final",
        intended: [1, 2, 3],
        snapshot: {
          source: "native",
          status: "available",
          width,
          height,
          values: Float64Array.of(1, 2, 3),
        },
      })
    ).toThrow("positive safe integer map dimensions");
  });

  it.each([
    { intended: new Array<number>(2) },
    { intended: [0, NaN] },
    { intended: [0, Infinity] },
    { intended: [0, -Infinity] },
  ])("rejects non-finite or sparse intent", ({ intended }) => {
    expect(() =>
      measureStandardElevationProjection({
        phase: "final",
        intended,
        snapshot: {
          source: "native",
          status: "available",
          width: 2,
          height: 1,
          values: Float64Array.of(0, 0),
        },
      })
    ).toThrow("finite intent");
  });

  it.each([
    { intended: [-Number.MAX_VALUE], observed: [Number.MAX_VALUE] },
    { intended: [0, 0], observed: [1e308, 1e308] },
  ])("rejects overflowing point errors or accumulated errors instead of emitting Infinity", ({
    intended,
    observed,
  }) => {
    expect(() =>
      measureStandardElevationProjection({
        phase: "final",
        intended,
        snapshot: {
          source: "native",
          status: "available",
          width: intended.length,
          height: 1,
          values: Float64Array.from(observed),
        },
      })
    ).toThrow("finite numeric error range");
  });
});
