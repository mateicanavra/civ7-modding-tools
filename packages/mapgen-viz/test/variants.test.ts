import { describe, expect, it } from "bun:test";
import { buildScalarFieldProjections, buildVectorFieldProjections } from "../src/index.js";

describe("visualization variant projectors", () => {
  it("borrows one scalar grid and derives a deterministic sampled-point view", () => {
    const values = new Uint8Array([1, 2, 3, 4, 5, 6]);
    const projections = buildScalarFieldProjections({
      dataTypeKey: "ecology.biome.index",
      spaceId: "tile.hexOddQ",
      dims: { width: 3, height: 2 },
      field: { format: "u8", values },
      meta: { label: "Biome Index", palette: "categorical" },
      points: { sampleStep: 2, debugOnly: true },
    });

    expect(projections).toHaveLength(2);
    expect(projections[0]).toMatchObject({
      kind: "grid",
      dataTypeKey: "ecology.biome.index",
      field: { format: "u8", values },
      meta: { label: "Biome Index", role: undefined, visibility: "default" },
    });
    expect(projections[1]).toMatchObject({
      kind: "points",
      meta: { role: "centroids", visibility: "debug" },
    });
    const points = projections[1];
    if (points?.kind !== "points") throw new Error("Expected a sampled-point projection.");
    expect(Array.from(points.positions)).toEqual([0, 0, 2, 0]);
    expect(Array.from(points.values?.values ?? [])).toEqual([1, 3]);
    expect(values).toEqual(new Uint8Array([1, 2, 3, 4, 5, 6]));
  });

  it("derives vector magnitude and stable field, arrow, and point variants", () => {
    const projections = buildVectorFieldProjections({
      dataTypeKey: "foundation.motion",
      spaceId: "tile.hexOddQ",
      dims: { width: 2, height: 2 },
      u: { format: "f32", values: new Float32Array([3, 0, 0, -4]) },
      v: { format: "f32", values: new Float32Array([4, 0, 2, 0]) },
      meta: { label: "Plate Motion", palette: "continuous" },
      vector: { debugOnly: true },
      magnitude: {},
      arrows: { sampleStep: 1, maxArrowLengthTiles: 2 },
      points: { sampleStep: 2 },
    });

    expect(projections.map((projection) => projection.kind)).toEqual([
      "gridFields",
      "grid",
      "segments",
      "points",
    ]);
    const fields = projections[0];
    if (fields?.kind !== "gridFields") throw new Error("Expected vector grid fields.");
    expect(Object.keys(fields.fields)).toEqual(["u", "v", "magnitude"]);
    expect(Array.from(fields.fields.magnitude?.values ?? [])).toEqual([5, 0, 2, 4]);
    expect(fields.meta).toMatchObject({ role: "vector", visibility: "debug" });

    const arrows = projections[2];
    if (arrows?.kind !== "segments") throw new Error("Expected arrow segments.");
    expect(Array.from(arrows.segments)).toEqual([
      0, 0, 1.2000000476837158, 1.600000023841858, 0, 1, 0, 1.7999999523162842, 1, 1,
      -0.6000000238418579, 1,
    ]);
    expect(Array.from(arrows.values?.values ?? [])).toEqual([5, 2, 4]);

    const points = projections[3];
    if (points?.kind !== "points") throw new Error("Expected magnitude points.");
    expect(Array.from(points.positions)).toEqual([0, 0]);
    expect(Array.from(points.values?.values ?? [])).toEqual([5]);
  });

  it("rejects invalid sampling and arrow geometry options", () => {
    expect(() =>
      buildScalarFieldProjections({
        dataTypeKey: "invalid.sample",
        spaceId: "tile.hexOddQ",
        dims: { width: 1, height: 1 },
        field: { format: "u8", values: new Uint8Array([1]) },
        points: { sampleStep: 0 },
      })
    ).toThrow("positive integer");

    expect(() =>
      buildVectorFieldProjections({
        dataTypeKey: "invalid.arrows",
        spaceId: "tile.hexOddQ",
        dims: { width: 1, height: 1 },
        u: { format: "f32", values: new Float32Array([1]) },
        v: { format: "f32", values: new Float32Array([1]) },
        arrows: { maxArrowLengthTiles: Number.POSITIVE_INFINITY },
      })
    ).toThrow("positive and finite");
  });
});
