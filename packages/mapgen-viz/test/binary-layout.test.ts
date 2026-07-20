import { describe, expect, it } from "bun:test";
import {
  assertVizBinaryByteLength,
  expectedVizBinaryByteLength,
  type VizBinaryLayout,
} from "../src/index.js";

const CASES: readonly (readonly [VizBinaryLayout, number])[] = [
  [{ kind: "grid-values", format: "u8", width: 3, height: 2 }, 6],
  [{ kind: "grid-field-values", format: "i8", width: 3, height: 2 }, 6],
  [{ kind: "grid-values", format: "u16", width: 3, height: 2 }, 12],
  [{ kind: "grid-field-values", format: "i16", width: 3, height: 2 }, 12],
  [{ kind: "grid-values", format: "i32", width: 3, height: 2 }, 24],
  [{ kind: "grid-field-values", format: "f32", width: 3, height: 2 }, 24],
  [{ kind: "points-positions", count: 3 }, 24],
  [{ kind: "points-values", format: "u16", count: 3 }, 6],
  [{ kind: "segments-geometry", count: 3 }, 48],
  [{ kind: "segments-values", format: "f32", count: 3 }, 12],
];

describe("serialized visualization binary layout", () => {
  it.each(CASES)("owns one exact byte length for %#", (layout, expected) => {
    expect(expectedVizBinaryByteLength(layout)).toBe(expected);
    expect(() => assertVizBinaryByteLength(expected, layout)).not.toThrow();
    expect(() => assertVizBinaryByteLength(expected - 1, layout)).toThrow(
      `requires exactly ${expected} bytes`
    );
    expect(() => assertVizBinaryByteLength(expected + 1, layout)).toThrow(
      `requires exactly ${expected} bytes`
    );
  });

  it("refuses invalid or unsafe cardinalities before computing a byte length", () => {
    expect(() =>
      expectedVizBinaryByteLength({ kind: "grid-values", format: "u8", width: 0, height: 1 })
    ).toThrow("grid width must be a positive safe integer");
    expect(() =>
      expectedVizBinaryByteLength({
        kind: "segments-geometry",
        count: Number.MAX_SAFE_INTEGER,
      })
    ).toThrow("exceeds the safe integer range");
  });
});
