import { describe, expect, it } from "bun:test";
import {
  admitVizScalarSource,
  computeVizScalarStats,
  materializeVizProjection,
  type VizBinaryMaterializer,
  type VizBinarySlot,
  type VizInlineRef,
  type VizPathRef,
  type VizProjection,
} from "../src/index.js";

const context = { stepId: "standard.test.project", phase: "test" } as const;

function pathMaterializer(calls: VizBinarySlot[]): VizBinaryMaterializer<VizPathRef> {
  return (slot) => {
    calls.push(slot);
    const field = slot.kind === "grid-field-values" ? `/${slot.fieldKey}` : "";
    return { kind: "path", path: `${slot.kind}${field}.bin` };
  };
}

describe("materializeVizProjection", () => {
  it("materializes a scalar grid with canonical identity, bounds, and truthful statistics", () => {
    const calls: VizBinarySlot[] = [];
    const layer = materializeVizProjection(
      {
        kind: "grid",
        dataTypeKey: "morphology.elevation",
        variantKey: "final",
        spaceId: "tile.hexOddQ",
        meta: { role: "height" },
        dims: { width: 2, height: 2 },
        field: {
          format: "f32",
          values: new Float32Array([3, Number.NaN, -9, 7]),
          valueSpec: {
            scale: "linear",
            domain: { kind: "fromStats" },
            noData: { kind: "sentinel", value: -9 },
          },
        },
      },
      context,
      pathMaterializer(calls)
    );

    expect(layer).toMatchObject({
      kind: "grid",
      layerKey: "standard.test.project::morphology.elevation::tile.hexOddQ::grid:height::final",
      stepId: context.stepId,
      phase: context.phase,
      bounds: [0, 0, 2, 2],
      dims: { width: 2, height: 2 },
      field: { format: "f32", stats: { min: 3, max: 7 } },
    });
    expect(calls.map((call) => call.kind)).toEqual(["grid-values"]);
  });

  it("derives point and segment bounds, counts, and scalar cardinality", () => {
    const pointCalls: VizBinarySlot[] = [];
    const points = materializeVizProjection(
      {
        kind: "points",
        dataTypeKey: "foundation.sites",
        spaceId: "world.xy",
        positions: new Float32Array([2, 4, -1, 8]),
        values: { format: "i8", values: new Int8Array([-2, 5]) },
      },
      context,
      pathMaterializer(pointCalls)
    );
    expect(points).toMatchObject({ kind: "points", count: 2, bounds: [-1, 4, 2, 8] });
    expect(pointCalls.map((call) => call.kind)).toEqual(["points-positions", "points-values"]);

    const segmentCalls: VizBinarySlot[] = [];
    const segments = materializeVizProjection(
      {
        kind: "segments",
        dataTypeKey: "foundation.edges",
        spaceId: "mesh.world",
        segments: new Float32Array([0, 0, 1, 1, -2, 3, 4, -5]),
        values: { format: "u8", values: new Uint8Array([4, 9]) },
      },
      context,
      pathMaterializer(segmentCalls)
    );
    expect(segments).toMatchObject({ kind: "segments", count: 2, bounds: [-2, -5, 4, 3] });
    expect(segmentCalls.map((call) => call.kind)).toEqual(["segments-geometry", "segments-values"]);
  });

  it("preserves field insertion order and admits integer vector components", () => {
    const calls: VizBinarySlot[] = [];
    const layer = materializeVizProjection(
      {
        kind: "gridFields",
        dataTypeKey: "foundation.movement",
        spaceId: "tile.hexOddQ",
        dims: { width: 2, height: 1 },
        fields: {
          magnitude: { format: "f32", values: new Float32Array([1, 2]) },
          u: { format: "i8", values: new Int8Array([1, -1]) },
          v: { format: "i8", values: new Int8Array([0, 1]) },
        },
        vector: { u: "u", v: "v", magnitude: "magnitude" },
      },
      context,
      pathMaterializer(calls)
    );

    expect(layer.kind).toBe("gridFields");
    if (layer.kind !== "gridFields") throw new Error("Expected grid-fields layer.");
    expect(Object.keys(layer.fields)).toEqual(["magnitude", "u", "v"]);
    expect(calls.map((call) => (call.kind === "grid-field-values" ? call.fieldKey : ""))).toEqual([
      "magnitude",
      "u",
      "v",
    ]);
  });

  it("uses one canonical viewport for empty geometry", () => {
    const emptyPoints = materializeVizProjection(
      {
        kind: "points",
        dataTypeKey: "placement.empty",
        spaceId: "world.xy",
        positions: new Float32Array(),
      },
      context,
      () => ({ kind: "path", path: "empty.bin" })
    );
    expect(emptyPoints).toMatchObject({ count: 0, bounds: [0, 0, 1, 1] });
  });

  it("rejects malformed projections before materializing any slot", () => {
    const invalid: ReadonlyArray<{ projection: VizProjection; message: string }> = [
      {
        projection: {
          kind: "gridFields" as const,
          dataTypeKey: "invalid.field-cardinality",
          spaceId: "tile.hexOddQ" as const,
          dims: { width: 2, height: 1 },
          fields: { value: { format: "u8" as const, values: new Uint8Array(1) } },
        },
        message: "requires 2 scalar values",
      },
      {
        projection: {
          kind: "grid" as const,
          dataTypeKey: "invalid.dims",
          spaceId: "tile.hexOddQ" as const,
          dims: { width: 0, height: 1 },
          field: { format: "u8" as const, values: new Uint8Array() },
        },
        message: "positive safe integer",
      },
      {
        projection: {
          kind: "grid" as const,
          dataTypeKey: "invalid.cardinality",
          spaceId: "tile.hexOddQ" as const,
          dims: { width: 2, height: 2 },
          field: { format: "u8" as const, values: new Uint8Array(3) },
        },
        message: "requires 4 scalar values",
      },
      {
        projection: {
          kind: "points" as const,
          dataTypeKey: "invalid.points",
          spaceId: "world.xy" as const,
          positions: new Float32Array([1]),
        },
        message: "complete [x, y] pairs",
      },
      {
        projection: {
          kind: "segments" as const,
          dataTypeKey: "invalid.segments",
          spaceId: "world.xy" as const,
          segments: new Float32Array([0, 0, Number.POSITIVE_INFINITY, 1]),
        },
        message: "finite coordinates",
      },
      {
        projection: {
          kind: "gridFields" as const,
          dataTypeKey: "invalid.vector",
          spaceId: "tile.hexOddQ" as const,
          dims: { width: 1, height: 1 },
          fields: { u: { format: "i8" as const, values: new Int8Array(1) } },
          vector: { u: "u", v: "v" },
        },
        message: "u and v references",
      },
      {
        projection: {
          kind: "gridFields" as const,
          dataTypeKey: "invalid.magnitude",
          spaceId: "tile.hexOddQ" as const,
          dims: { width: 1, height: 1 },
          fields: {
            u: { format: "i8" as const, values: new Int8Array(1) },
            v: { format: "i8" as const, values: new Int8Array(1) },
          },
          vector: { u: "u", v: "v", magnitude: "magnitude" },
        },
        message: "magnitude reference",
      },
    ];

    for (const { projection, message } of invalid) {
      let calls = 0;
      expect(() =>
        materializeVizProjection(projection, context, () => {
          calls += 1;
          return { kind: "path", path: "unexpected.bin" };
        })
      ).toThrow(message);
      expect(calls).toBe(0);
    }
  });

  it("propagates adapter failure without retrying a binary slot", () => {
    const calls: string[] = [];
    expect(() =>
      materializeVizProjection(
        {
          kind: "points",
          dataTypeKey: "adapter.failure",
          spaceId: "world.xy",
          positions: new Float32Array([0, 0]),
          values: { format: "u8", values: new Uint8Array([1]) },
        },
        context,
        (slot) => {
          calls.push(slot.kind);
          if (slot.kind === "points-values") throw new Error("adapter refused");
          return { kind: "path", path: "positions.bin" };
        }
      )
    ).toThrow("adapter refused");
    expect(calls).toEqual(["points-positions", "points-values"]);
  });

  it("allows an inline adapter to copy an exact subview without mutating its source", () => {
    const backing = new Uint8Array([90, 4, 7, 91]);
    const values = new Uint8Array(backing.buffer, 1, 2);
    const inline: VizBinaryMaterializer<VizInlineRef> = ({ source }) => {
      const copy = new Uint8Array(source.byteLength);
      copy.set(new Uint8Array(source.buffer, source.byteOffset, source.byteLength));
      return { kind: "inline", buffer: copy.buffer };
    };
    const layer = materializeVizProjection(
      {
        kind: "grid",
        dataTypeKey: "subview",
        spaceId: "tile.hexOddQ",
        dims: { width: 2, height: 1 },
        field: { format: "u8", values },
      },
      context,
      inline
    );

    expect(layer.kind).toBe("grid");
    if (layer.kind !== "grid" || layer.field.data.kind !== "inline") {
      throw new Error("Expected inline grid field.");
    }
    expect(layer.field.data.buffer).not.toBe(backing.buffer);
    expect(layer.field.data.buffer.byteLength).toBe(2);
    expect(Array.from(new Uint8Array(layer.field.data.buffer))).toEqual([4, 7]);
    expect(Array.from(backing)).toEqual([90, 4, 7, 91]);
  });

  it("snapshots semantic metadata that participates in identity and statistics", () => {
    const meta = {
      role: "before",
      categories: [
        { value: 1, label: "One", color: [1, 2, 3, 4] as [number, number, number, number] },
      ],
    };
    const valueSpec = {
      scale: "linear" as const,
      domain: { kind: "explicit" as const, min: 0, max: 10 },
      noData: { kind: "sentinel" as const, value: -1 },
      transform: {
        kind: "piecewise" as const,
        points: [
          { x: 0, y: 0 },
          { x: 1, y: 1 },
        ],
      },
    };
    const layer = materializeVizProjection(
      {
        kind: "grid",
        dataTypeKey: "snapshot",
        spaceId: "tile.hexOddQ",
        meta,
        dims: { width: 2, height: 1 },
        field: { format: "i8", values: new Int8Array([-1, 6]), valueSpec },
      },
      context,
      () => ({ kind: "path", path: "snapshot.bin" })
    );

    meta.role = "after";
    meta.categories[0]!.label = "Changed";
    meta.categories[0]!.color[0] = 99;
    valueSpec.noData.value = 6;
    valueSpec.domain.max = 99;
    valueSpec.transform.points[0]!.x = 99;

    expect(layer.layerKey).toContain("grid:before");
    expect(layer.meta).toEqual({
      role: "before",
      categories: [{ value: 1, label: "One", color: [1, 2, 3, 4] }],
    });
    expect(layer.kind).toBe("grid");
    if (layer.kind !== "grid") throw new Error("Expected grid layer.");
    expect(layer.field.stats).toEqual({ min: 6, max: 6 });
    expect(layer.field.valueSpec).toEqual({
      scale: "linear",
      domain: { kind: "explicit", min: 0, max: 10 },
      noData: { kind: "sentinel", value: -1 },
      transform: {
        kind: "piecewise",
        points: [
          { x: 0, y: 0 },
          { x: 1, y: 1 },
        ],
      },
    });

    const normalizeDomain = { kind: "explicit" as const, min: 0, max: 1 };
    const normalized = materializeVizProjection(
      {
        kind: "grid",
        dataTypeKey: "normalize-snapshot",
        spaceId: "tile.hexOddQ",
        dims: { width: 1, height: 1 },
        field: {
          format: "u8",
          values: new Uint8Array([1]),
          valueSpec: {
            scale: "linear",
            domain: { kind: "fromStats" },
            transform: { kind: "normalize", domain: normalizeDomain },
          },
        },
      },
      context,
      () => ({ kind: "path", path: "normalize.bin" })
    );
    normalizeDomain.max = 99;
    if (normalized.kind !== "grid") throw new Error("Expected normalized grid layer.");
    expect(normalized.field.valueSpec?.transform).toEqual({
      kind: "normalize",
      domain: { kind: "explicit", min: 0, max: 1 },
    });
  });
});

describe("scalar source admission and statistics", () => {
  it("admits every scalar format only with its matching typed-array representation", () => {
    const cases = [
      ["u8", new Uint8Array([1])],
      ["i8", new Int8Array([1])],
      ["u16", new Uint16Array([1])],
      ["i16", new Int16Array([1])],
      ["i32", new Int32Array([1])],
      ["f32", new Float32Array([1])],
    ] as const;
    for (const [format, values] of cases) {
      const source = admitVizScalarSource({ format, values });
      expect(source.format).toBe(format);
      expect(source.values).toBe(values);
      expect(source.valueSpec).toBeUndefined();
    }

    const mismatches = [
      ["u8", new Int8Array([1])],
      ["i8", new Uint16Array([1])],
      ["u16", new Int16Array([1])],
      ["i16", new Int32Array([1])],
      ["i32", new Float32Array([1])],
      ["f32", new Uint8Array([1])],
    ] as const;
    for (const [format, values] of mismatches) {
      expect(() => admitVizScalarSource({ format, values })).toThrow("does not match");
    }
  });

  it("ignores no-data and nonfinite observations without escaping an exact subview", () => {
    const backing = new Float32Array([99, -1, 4, Number.NaN, 88]);
    const source = admitVizScalarSource({
      format: "f32",
      values: new Float32Array(backing.buffer, Float32Array.BYTES_PER_ELEMENT, 3),
      valueSpec: {
        scale: "linear",
        domain: { kind: "fromStats" },
        noData: { kind: "sentinel", value: -1 },
      },
    });
    expect(computeVizScalarStats(source)).toEqual({ min: 4, max: 4 });

    const allNoData = admitVizScalarSource({
      format: "f32",
      values: new Float32Array([Number.NaN, Number.POSITIVE_INFINITY]),
      valueSpec: {
        scale: "linear",
        domain: { kind: "fromStats" },
        noData: { kind: "nan" },
      },
    });
    expect(computeVizScalarStats(allNoData)).toBeNull();
  });
});
