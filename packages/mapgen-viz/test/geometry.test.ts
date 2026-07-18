import { describe, expect, test } from "bun:test";
import {
  buildNeighborSegments,
  buildSampledVectorSegments,
  interleaveXY,
} from "../src/geometry.js";

describe("projection geometry helpers", () => {
  test("interleaves coordinate arrays and truncates to the shorter source", () => {
    expect(Array.from(interleaveXY([1, 2, 3], new Float64Array([4, 5])))).toEqual([1, 4, 2, 5]);
  });

  test("builds one segment per valid undirected CSR neighbor edge", () => {
    const segments = buildNeighborSegments({
      offsets: new Int32Array([0, 3, 5, 7]),
      neighbors: new Int32Array([1, 2, 9, 0, 2, 0, 1]),
      x: new Float32Array([0, 1, 0]),
      y: new Float32Array([0, 0, 1]),
    });

    expect(Array.from(segments)).toEqual([0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1]);
    expect(buildNeighborSegments({ offsets: [0], neighbors: [], x: [0], y: [0] })).toEqual(
      new Float32Array()
    );
  });

  test("samples and normalizes point vectors without mutating or emitting invalid sources", () => {
    const x = new Float32Array([0, 10, Number.NaN]);
    const y = new Float32Array([1, 11, 21]);
    const u = new Float32Array([3, 1, Number.POSITIVE_INFINITY]);
    const v = new Float32Array([4, 2, 1]);
    const magnitudes = new Float32Array([5, 2, 1]);

    const projected = buildSampledVectorSegments({ x, y, u, v, magnitudes });

    expect(Array.from(projected.segments)).toEqual(
      Array.from(new Float32Array([0, 1, 0.48, 1.64, 10, 11, 10.16, 11.32]))
    );
    expect(Array.from(projected.values)).toEqual([5, 2]);
    expect(Array.from(x)).toEqual([0, 10, Number.NaN]);
    expect(Array.from(u)).toEqual([3, 1, Number.POSITIVE_INFINITY]);
  });
});
