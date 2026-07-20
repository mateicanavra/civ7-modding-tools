import { describe, expect, it } from "bun:test";
import { compareExactNumericGrids } from "../src/index.js";

describe("exact numeric grid comparison", () => {
  it("reports a complete exact match", () => {
    expect(
      compareExactNumericGrids(
        { width: 2, height: 2, values: [1, 2, null, 4] },
        { width: 2, height: 2, values: [1, 2, null, 4] }
      )
    ).toEqual({
      outcome: "match",
      compared: 4,
      missingObserved: 1,
      mismatches: 0,
      mismatchRatio: 0,
      examples: [],
      pairCounts: [],
    });
  });

  it("keeps missing observations as explicit mismatches", () => {
    expect(
      compareExactNumericGrids(
        { width: 3, height: 1, values: [1, 2, 3] },
        { width: 3, height: 1, values: [9, null, 3] }
      )
    ).toEqual({
      outcome: "mismatch",
      compared: 3,
      missingObserved: 1,
      mismatches: 2,
      mismatchRatio: 2 / 3,
      examples: [
        { x: 0, y: 0, expected: 1, observed: 9, reason: "value-mismatch" },
        { x: 1, y: 0, expected: 2, observed: null, reason: "missing-observation" },
      ],
      pairCounts: [
        { expected: 1, observed: 9, count: 1 },
        { expected: 2, observed: null, count: 1 },
      ],
    });
  });

  it("refuses incompatible dimensions before comparing cells", () => {
    expect(
      compareExactNumericGrids(
        { width: 2, height: 2, values: [1, 2, 3, 4] },
        { width: 1, height: 4, values: [1, 2, 3, 4] }
      )
    ).toEqual({
      outcome: "incompatible",
      reason: "dimension-mismatch",
      expected: { width: 2, height: 2, cardinality: 4 },
      observed: { width: 1, height: 4, cardinality: 4 },
    });
  });

  it("refuses dimensions that are not positive safe integers", () => {
    expect(
      compareExactNumericGrids(
        { width: 0, height: 1, values: [] },
        { width: 1, height: 1, values: [1] }
      )
    ).toEqual({
      outcome: "incompatible",
      reason: "invalid-expected-dimensions",
      expected: { width: 0, height: 1, cardinality: 0 },
      observed: { width: 1, height: 1, cardinality: 1 },
    });
  });

  it("refuses invalid cardinality before comparing cells", () => {
    expect(
      compareExactNumericGrids(
        { width: 2, height: 2, values: [1, 2, 3] },
        { width: 2, height: 2, values: [1, 2, 3, 4] }
      )
    ).toEqual({
      outcome: "incompatible",
      reason: "expected-cardinality-mismatch",
      expected: { width: 2, height: 2, cardinality: 3 },
      observed: { width: 2, height: 2, cardinality: 4 },
    });
  });

  it("symmetrically refuses invalid observed dimensions and cardinality", () => {
    expect(
      compareExactNumericGrids(
        { width: 1, height: 1, values: [1] },
        { width: 1, height: 0, values: [] }
      )
    ).toEqual({
      outcome: "incompatible",
      reason: "invalid-observed-dimensions",
      expected: { width: 1, height: 1, cardinality: 1 },
      observed: { width: 1, height: 0, cardinality: 0 },
    });

    expect(
      compareExactNumericGrids(
        { width: 2, height: 2, values: [1, 2, 3, 4] },
        { width: 2, height: 2, values: [1, 2, 3] }
      )
    ).toEqual({
      outcome: "incompatible",
      reason: "observed-cardinality-mismatch",
      expected: { width: 2, height: 2, cardinality: 4 },
      observed: { width: 2, height: 2, cardinality: 3 },
    });
  });

  it("orders tied pairs by first observation and respects both evidence bounds", () => {
    expect(
      compareExactNumericGrids(
        { width: 3, height: 2, values: [1, 2, 1, 3, 2, 3] },
        { width: 3, height: 2, values: [8, 9, 8, 7, 9, 6] },
        { maxExamples: 2, maxPairs: 2 }
      )
    ).toMatchObject({
      outcome: "mismatch",
      examples: [
        { x: 0, y: 0, expected: 1, observed: 8 },
        { x: 1, y: 0, expected: 2, observed: 9 },
      ],
      pairCounts: [
        { expected: 1, observed: 8, count: 2 },
        { expected: 2, observed: 9, count: 2 },
      ],
    });
  });

  it("rejects invalid evidence limits instead of silently changing comparison bounds", () => {
    expect(() =>
      compareExactNumericGrids(
        { width: 1, height: 1, values: [1] },
        { width: 1, height: 1, values: [2] },
        { maxExamples: -1 }
      )
    ).toThrow("maxExamples must be a nonnegative safe integer");
  });

  it("supports zero evidence bounds without changing mismatch totals", () => {
    expect(
      compareExactNumericGrids(
        { width: 1, height: 1, values: [1] },
        { width: 1, height: 1, values: [2] },
        { maxExamples: 0, maxPairs: 0 }
      )
    ).toEqual({
      outcome: "mismatch",
      compared: 1,
      missingObserved: 0,
      mismatches: 1,
      mismatchRatio: 1,
      examples: [],
      pairCounts: [],
    });
  });
});
