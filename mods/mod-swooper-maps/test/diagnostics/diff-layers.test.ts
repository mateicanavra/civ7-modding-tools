import { describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { admitPathVizManifest, createVizLayerKey, type PathVizManifest } from "@swooper/mapgen-viz";
import {
  diffComparableLayerPair,
  pairComparableLayers,
} from "../../scripts/diagnostics/diff-layers.js";

const STEP = { stepId: "test.step", stageId: "foundation", stepIndex: 0 } as const;

function gridLayer(
  dataTypeKey: string,
  path: string,
  options: Readonly<{ width?: number; height?: number; format?: "u8" | "f32" }> = {}
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
    ).toMatchObject({ note: "dimension mismatch: 2x3 vs 1x6" });
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
        hamming: 2,
        hammingPct: 1,
        nonFiniteMismatchCount: 2,
      });
      expect(diff).not.toHaveProperty("maxAbsDiff");
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
        hamming: 2,
        hammingPct: 1,
        nonFiniteMismatchCount: 1,
        maxAbsDiff: 3,
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
