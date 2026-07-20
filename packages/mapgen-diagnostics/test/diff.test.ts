import { describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  admitPathVizManifest,
  createVizLayerKey,
  type PathVizManifest,
  type VizScalarFormat,
} from "@swooper/mapgen-viz";
import { diffComparableLayerPair, diffPathVizRuns, pairComparableLayers } from "../src/index.js";

const STEP = { stepId: "test.step", stageId: "foundation", stepIndex: 0 } as const;

function gridLayer(
  dataTypeKey: string,
  path: string,
  options: Readonly<{ width?: number; height?: number; format?: VizScalarFormat }> = {}
): Record<string, unknown> {
  const width = options.width ?? 1;
  const height = options.height ?? 1;
  return {
    kind: "grid",
    layerKey: createVizLayerKey({
      stepId: STEP.stepId,
      dataTypeKey,
      spaceId: "tile.hexOddQ",
      kind: "grid",
    }),
    dataTypeKey,
    ...STEP,
    spaceId: "tile.hexOddQ",
    bounds: [0, 0, width, height],
    dims: { width, height },
    field: { format: options.format ?? "u8", data: { kind: "path", path } },
  };
}

function pointLayer(dataTypeKey: string, path: string): Record<string, unknown> {
  return {
    kind: "points",
    layerKey: createVizLayerKey({
      stepId: STEP.stepId,
      dataTypeKey,
      spaceId: "world.xy",
      kind: "points",
    }),
    dataTypeKey,
    ...STEP,
    spaceId: "world.xy",
    bounds: [0, 0, 1, 1],
    count: 1,
    positions: { kind: "path", path },
  };
}

function manifest(runId: string, layers: readonly Record<string, unknown>[]): PathVizManifest {
  return admitPathVizManifest({
    version: 2,
    runId,
    planFingerprint: "plan-1",
    steps: [STEP],
    layers,
  });
}

describe("diagnostic layer pairing", () => {
  it("pairs by canonical layer identity across changed payload paths and reports both unmatched sides", () => {
    const sharedDataTypeKey = "test.shared";
    const left = manifest("left", [
      gridLayer(sharedDataTypeKey, "data/left-shared.bin"),
      gridLayer("test.left-only", "data/left-only.bin"),
    ]);
    const right = manifest("right", [
      gridLayer(sharedDataTypeKey, "data/right-shared.bin"),
      gridLayer("test.right-only", "data/right-only.bin"),
    ]);

    const result = pairComparableLayers({ manifestA: left, manifestB: right });

    expect(result.pairs).toHaveLength(1);
    expect(result.pairs[0]?.[0].layerKey).toBe(result.pairs[0]?.[1].layerKey);
    expect(result.pairs[0]?.[0].path).toBe("data/left-shared.bin");
    expect(result.pairs[0]?.[1].path).toBe("data/right-shared.bin");
    expect(result.unmatchedLeft.map((row) => row.dataTypeKey)).toEqual(["test.left-only"]);
    expect(result.unmatchedRight.map((row) => row.dataTypeKey)).toEqual(["test.right-only"]);
  });

  it("records width or height mismatch before reading equal-cardinality payloads", () => {
    const left = manifest("left", [
      gridLayer("test.reshape", "data/left.bin", { width: 2, height: 3 }),
    ]);
    const right = manifest("right", [
      gridLayer("test.reshape", "data/right.bin", { width: 1, height: 6 }),
    ]);
    const pair = pairComparableLayers({ manifestA: left, manifestB: right }).pairs[0];
    if (!pair) throw new Error("Expected one comparable fixture pair.");

    expect(
      diffComparableLayerPair({
        runDirA: "/not-read/left",
        runDirB: "/not-read/right",
        manifestA: left,
        manifestB: right,
        left: pair[0],
        right: pair[1],
      })
    ).toEqual({
      layerKey: pair[0].layerKey,
      dataTypeKey: "test.reshape",
      variantKey: null,
      stepIdA: STEP.stepId,
      stepIdB: STEP.stepId,
      outcome: "dimension-incompatible",
      dimensionsA: { width: 2, height: 3 },
      dimensionsB: { width: 1, height: 6 },
      formatA: "u8",
      formatB: "u8",
    });
  });

  it("reports incompatible scalar formats without reading either payload", () => {
    const left = manifest("left", [gridLayer("test.format", "data/left.bin")]);
    const right = manifest("right", [
      gridLayer("test.format", "data/right.bin", { format: "f32" }),
    ]);
    const pair = pairComparableLayers({ manifestA: left, manifestB: right }).pairs[0];
    if (!pair) throw new Error("Expected one comparable fixture pair.");

    expect(
      diffComparableLayerPair({
        runDirA: "/not-read/left",
        runDirB: "/not-read/right",
        manifestA: left,
        manifestB: right,
        left: pair[0],
        right: pair[1],
      })
    ).toMatchObject({
      outcome: "format-incompatible",
      formatA: "u8",
      formatB: "f32",
    });
  });

  it("reports non-grid and unsupported scalar pairs as closed unsupported states", () => {
    const pointLeft = manifest("left", [pointLayer("test.points", "data/left-points.bin")]);
    const pointRight = manifest("right", [pointLayer("test.points", "data/right-points.bin")]);
    const pointPair = pairComparableLayers({
      manifestA: pointLeft,
      manifestB: pointRight,
    }).pairs[0];
    if (!pointPair) throw new Error("Expected one non-grid fixture pair.");

    expect(
      diffComparableLayerPair({
        runDirA: "/not-read/left",
        runDirB: "/not-read/right",
        manifestA: pointLeft,
        manifestB: pointRight,
        left: pointPair[0],
        right: pointPair[1],
      })
    ).toMatchObject({
      outcome: "unsupported",
      reason: "non-grid",
      layerKindA: "points",
      layerKindB: "points",
    });

    const scalarLeft = manifest("left", [
      gridLayer("test.scalar", "data/left-scalar.bin", { format: "i8" }),
    ]);
    const scalarRight = manifest("right", [
      gridLayer("test.scalar", "data/right-scalar.bin", { format: "i8" }),
    ]);
    const scalarPair = pairComparableLayers({
      manifestA: scalarLeft,
      manifestB: scalarRight,
    }).pairs[0];
    if (!scalarPair) throw new Error("Expected one unsupported scalar fixture pair.");

    expect(
      diffComparableLayerPair({
        runDirA: "/not-read/left",
        runDirB: "/not-read/right",
        manifestA: scalarLeft,
        manifestB: scalarRight,
        left: scalarPair[0],
        right: scalarPair[1],
      })
    ).toMatchObject({ outcome: "unsupported", reason: "scalar-format", format: "i8" });
  });

  it("counts NaN/finite and infinity/finite mismatches without inventing a maximum", () => {
    const root = mkdtempSync(join(tmpdir(), "swooper-diff-float-"));
    try {
      const leftDirectory = join(root, "left");
      const rightDirectory = join(root, "right");
      mkdirSync(join(leftDirectory, "data"), { recursive: true });
      mkdirSync(join(rightDirectory, "data"), { recursive: true });
      writeFileSync(
        join(leftDirectory, "data", "values.bin"),
        new Float32Array([Number.NaN, Infinity])
      );
      writeFileSync(join(rightDirectory, "data", "values.bin"), new Float32Array([1, 2]));
      const left = manifest("left", [
        gridLayer("test.float", "data/values.bin", { width: 2, format: "f32" }),
      ]);
      const right = manifest("right", [
        gridLayer("test.float", "data/values.bin", { width: 2, format: "f32" }),
      ]);
      const pair = pairComparableLayers({ manifestA: left, manifestB: right }).pairs[0];
      if (!pair) throw new Error("Expected one comparable fixture pair.");

      const diff = diffComparableLayerPair({
        runDirA: leftDirectory,
        runDirB: rightDirectory,
        manifestA: left,
        manifestB: right,
        left: pair[0],
        right: pair[1],
      });

      expect(diff).toMatchObject({
        outcome: "f32-comparison",
        format: "f32",
        hamming: 2,
        hammingPct: 1,
        nonFiniteMismatchCount: 2,
        maxAbsDiff: null,
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("computes maxAbsDiff only from finite differing pairs", () => {
    const root = mkdtempSync(join(tmpdir(), "swooper-diff-finite-max-"));
    try {
      const leftDirectory = join(root, "left");
      const rightDirectory = join(root, "right");
      mkdirSync(join(leftDirectory, "data"), { recursive: true });
      mkdirSync(join(rightDirectory, "data"), { recursive: true });
      writeFileSync(join(leftDirectory, "data", "values.bin"), new Float32Array([Number.NaN, 5]));
      writeFileSync(join(rightDirectory, "data", "values.bin"), new Float32Array([1, 8]));
      const left = manifest("left", [
        gridLayer("test.float", "data/values.bin", { width: 2, format: "f32" }),
      ]);
      const right = manifest("right", [
        gridLayer("test.float", "data/values.bin", { width: 2, format: "f32" }),
      ]);
      const pair = pairComparableLayers({ manifestA: left, manifestB: right }).pairs[0];
      if (!pair) throw new Error("Expected one comparable fixture pair.");

      expect(
        diffComparableLayerPair({
          runDirA: leftDirectory,
          runDirB: rightDirectory,
          manifestA: left,
          manifestB: right,
          left: pair[0],
          right: pair[1],
        })
      ).toMatchObject({
        outcome: "f32-comparison",
        format: "f32",
        hamming: 2,
        hammingPct: 1,
        nonFiniteMismatchCount: 1,
        maxAbsDiff: 3,
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("compares signed 16-bit grids through the integer result state", () => {
    const root = mkdtempSync(join(tmpdir(), "swooper-diff-i16-"));
    try {
      const leftDirectory = join(root, "left");
      const rightDirectory = join(root, "right");
      mkdirSync(join(leftDirectory, "data"), { recursive: true });
      mkdirSync(join(rightDirectory, "data"), { recursive: true });
      writeFileSync(join(leftDirectory, "data", "values.bin"), new Int16Array([-2, 3]));
      writeFileSync(join(rightDirectory, "data", "values.bin"), new Int16Array([-2, 7]));
      const left = manifest("left", [
        gridLayer("test.i16", "data/values.bin", { width: 2, format: "i16" }),
      ]);
      const right = manifest("right", [
        gridLayer("test.i16", "data/values.bin", { width: 2, format: "i16" }),
      ]);
      const pair = pairComparableLayers({ manifestA: left, manifestB: right }).pairs[0];
      if (!pair) throw new Error("Expected one signed-integer fixture pair.");

      expect(
        diffComparableLayerPair({
          runDirA: leftDirectory,
          runDirB: rightDirectory,
          manifestA: left,
          manifestB: right,
          left: pair[0],
          right: pair[1],
        })
      ).toMatchObject({
        outcome: "integer-comparison",
        format: "i16",
        hamming: 1,
        hammingPct: 0.5,
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("reads and diffs complete run directories through the public capability", () => {
    const root = mkdtempSync(join(tmpdir(), "swooper-diff-runs-"));
    try {
      const leftDirectory = join(root, "left");
      const rightDirectory = join(root, "right");
      mkdirSync(join(leftDirectory, "data"), { recursive: true });
      mkdirSync(join(rightDirectory, "data"), { recursive: true });
      writeFileSync(join(leftDirectory, "data", "values.bin"), new Uint8Array([1, 2]));
      writeFileSync(join(rightDirectory, "data", "values.bin"), new Uint8Array([1, 9]));
      writeFileSync(
        join(leftDirectory, "manifest.json"),
        JSON.stringify(manifest("left", [gridLayer("test.run", "data/values.bin", { width: 2 })]))
      );
      writeFileSync(
        join(rightDirectory, "manifest.json"),
        JSON.stringify(manifest("right", [gridLayer("test.run", "data/values.bin", { width: 2 })]))
      );

      expect(diffPathVizRuns({ runDirA: leftDirectory, runDirB: rightDirectory })).toMatchObject({
        runA: { runId: "left", runDir: leftDirectory },
        runB: { runId: "right", runDir: rightDirectory },
        unmatched: { left: [], right: [] },
        diffs: [
          {
            dataTypeKey: "test.run",
            outcome: "integer-comparison",
            format: "u8",
            hamming: 1,
            hammingPct: 0.5,
          },
        ],
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
