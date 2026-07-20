import type { VizScalarFormat } from "@swooper/mapgen-viz";
import {
  hammingU8,
  inventoryPathVizLayers,
  readF32Grid,
  readI16Grid,
  readU8Grid,
} from "./binary.js";
import { type PathVizManifest, readPathVizManifest } from "./evidence.js";

type LayerDiffIdentity = Readonly<{
  layerKey: string;
  dataTypeKey: string;
  variantKey: string | null;
  stepIdA: string;
  stepIdB: string;
}>;

type LayerDimensions = Readonly<{ width: number; height: number }>;
type LayerKind = PathVizManifest["layers"][number]["kind"];
type UnsupportedScalarFormat = Exclude<VizScalarFormat, "u8" | "i16" | "f32">;

/** Closed comparison result for one canonical path-backed layer pair. */
export type LayerDiffRow =
  | Readonly<
      LayerDiffIdentity & {
        outcome: "dimension-incompatible";
        dimensionsA: LayerDimensions;
        dimensionsB: LayerDimensions;
        formatA: VizScalarFormat;
        formatB: VizScalarFormat;
      }
    >
  | Readonly<
      LayerDiffIdentity & {
        outcome: "format-incompatible";
        formatA: VizScalarFormat;
        formatB: VizScalarFormat;
      }
    >
  | Readonly<
      LayerDiffIdentity & {
        outcome: "unsupported";
        reason: "non-grid";
        layerKindA: LayerKind;
        layerKindB: LayerKind;
      }
    >
  | Readonly<
      LayerDiffIdentity & {
        outcome: "unsupported";
        reason: "scalar-format";
        format: UnsupportedScalarFormat;
      }
    >
  | Readonly<
      LayerDiffIdentity & {
        outcome: "integer-comparison";
        format: "u8" | "i16";
        hamming: number;
        hammingPct: number;
      }
    >
  | Readonly<
      LayerDiffIdentity & {
        outcome: "f32-comparison";
        format: "f32";
        hamming: number;
        hammingPct: number;
        nonFiniteMismatchCount: number;
        maxAbsDiff: number | null;
      }
    >;

type Manifest = ReturnType<typeof readPathVizManifest>;
type LayerRow = ReturnType<typeof inventoryPathVizLayers>[number];
type GridLayer = Extract<Manifest["layers"][number], { kind: "grid" }>;

/** Canonical cross-run pairs plus every layer present on only one side. */
export type ComparableLayerPairs = Readonly<{
  pairs: readonly (readonly [LayerRow, LayerRow])[];
  unmatchedLeft: readonly LayerRow[];
  unmatchedRight: readonly LayerRow[];
}>;

/** Pairs cross-run layers only by their canonical semantic identity, never by payload location. */
export function pairComparableLayers(args: {
  manifestA: Manifest;
  manifestB: Manifest;
  prefix?: string;
  dataTypeKey?: string;
}): ComparableLayerPairs {
  const { manifestA, manifestB } = args;
  const rowsA = inventoryPathVizLayers(manifestA, {
    prefix: args.prefix,
    dataTypeKey: args.dataTypeKey,
  });
  const rowsB = inventoryPathVizLayers(manifestB, {
    prefix: args.prefix,
    dataTypeKey: args.dataTypeKey,
  });

  const byLayerKeyB = new Map(rowsB.map((row) => [row.layerKey, row] as const));
  const matchedLayerKeys = new Set<string>();
  const out: Array<[LayerRow, LayerRow]> = [];
  for (const rowA of rowsA) {
    const rowB = byLayerKeyB.get(rowA.layerKey);
    if (!rowB) continue;
    out.push([rowA, rowB]);
    matchedLayerKeys.add(rowA.layerKey);
  }
  return {
    pairs: out,
    unmatchedLeft: rowsA.filter((row) => !matchedLayerKeys.has(row.layerKey)),
    unmatchedRight: rowsB.filter((row) => !matchedLayerKeys.has(row.layerKey)),
  };
}

function findGridLayer(manifest: Manifest, row: LayerRow): GridLayer | undefined {
  return manifest.layers.find(
    (layer): layer is GridLayer => layer.kind === "grid" && layer.layerKey === row.layerKey
  );
}

function diffIdentity(left: LayerRow, right: LayerRow): LayerDiffIdentity {
  return {
    layerKey: left.layerKey,
    dataTypeKey: left.dataTypeKey,
    variantKey: left.variantKey ?? null,
    stepIdA: left.stepId,
    stepIdB: right.stepId,
  };
}

function requireGridLayer(manifest: Manifest, row: LayerRow): GridLayer {
  const layer = findGridLayer(manifest, row);
  if (!layer) throw new Error(`Missing paired grid layer "${row.layerKey}".`);
  return layer;
}

/** Diffs one canonical cross-run layer pair after refusing incompatible grid shapes. */
export function diffComparableLayerPair(args: {
  runDirA: string;
  runDirB: string;
  manifestA: Manifest;
  manifestB: Manifest;
  left: LayerRow;
  right: LayerRow;
}): LayerDiffRow {
  const { runDirA, runDirB, manifestA, manifestB, left, right } = args;
  const identity = diffIdentity(left, right);

  if (left.kind !== "grid" || right.kind !== "grid") {
    return {
      ...identity,
      outcome: "unsupported",
      reason: "non-grid",
      layerKindA: left.kind,
      layerKindB: right.kind,
    };
  }

  const leftDims = left.dims;
  const rightDims = right.dims;
  if (!leftDims || !rightDims || !left.format || !right.format) {
    throw new Error(`Missing paired grid evidence for "${left.layerKey}".`);
  }
  if (leftDims.width !== rightDims.width || leftDims.height !== rightDims.height) {
    return {
      ...identity,
      outcome: "dimension-incompatible",
      dimensionsA: leftDims,
      dimensionsB: rightDims,
      formatA: left.format,
      formatB: right.format,
    };
  }

  if (left.format !== right.format) {
    return {
      ...identity,
      outcome: "format-incompatible",
      formatA: left.format,
      formatB: right.format,
    };
  }

  if (left.format === "u8") {
    const leftGrid = readU8Grid(runDirA, requireGridLayer(manifestA, left));
    const rightGrid = readU8Grid(runDirB, requireGridLayer(manifestB, right));
    const hamming = hammingU8(leftGrid.values, rightGrid.values);
    return {
      ...identity,
      outcome: "integer-comparison",
      format: "u8",
      hamming,
      hammingPct: leftGrid.values.length > 0 ? hamming / leftGrid.values.length : 0,
    };
  }

  if (left.format === "i16") {
    const leftGrid = readI16Grid(runDirA, requireGridLayer(manifestA, left));
    const rightGrid = readI16Grid(runDirB, requireGridLayer(manifestB, right));
    let hamming = 0;
    for (let index = 0; index < leftGrid.values.length; index++) {
      if (leftGrid.values[index] !== rightGrid.values[index]) hamming++;
    }
    return {
      ...identity,
      outcome: "integer-comparison",
      format: "i16",
      hamming,
      hammingPct: leftGrid.values.length > 0 ? hamming / leftGrid.values.length : 0,
    };
  }

  if (left.format === "f32") {
    const leftGrid = readF32Grid(runDirA, requireGridLayer(manifestA, left));
    const rightGrid = readF32Grid(runDirB, requireGridLayer(manifestB, right));
    let hamming = 0;
    let nonFiniteMismatchCount = 0;
    let maxAbsDiff: number | null = null;
    for (let index = 0; index < leftGrid.values.length; index++) {
      const leftValue = leftGrid.values[index] as number;
      const rightValue = rightGrid.values[index] as number;
      if (Object.is(leftValue, rightValue)) continue;
      if (Number.isNaN(leftValue) && Number.isNaN(rightValue)) continue;
      hamming++;
      if (!Number.isFinite(leftValue) || !Number.isFinite(rightValue)) {
        nonFiniteMismatchCount++;
        continue;
      }
      const absoluteDifference = Math.abs(leftValue - rightValue);
      maxAbsDiff =
        maxAbsDiff === null ? absoluteDifference : Math.max(maxAbsDiff, absoluteDifference);
    }
    return {
      ...identity,
      outcome: "f32-comparison",
      format: "f32",
      hamming,
      hammingPct: leftGrid.values.length > 0 ? hamming / leftGrid.values.length : 0,
      nonFiniteMismatchCount,
      maxAbsDiff,
    };
  }

  return {
    ...identity,
    outcome: "unsupported",
    reason: "scalar-format",
    format: left.format,
  };
}

/** Complete neutral diff for two admitted path-backed diagnostic run directories. */
export type PathVizRunDiff = Readonly<{
  runA: Readonly<{ runId: string; runDir: string }>;
  runB: Readonly<{ runId: string; runDir: string }>;
  filter: Readonly<{ prefix: string | null; dataTypeKey: string | null }>;
  unmatched: Readonly<{
    left: readonly LayerRow[];
    right: readonly LayerRow[];
  }>;
  diffs: readonly LayerDiffRow[];
}>;

/**
 * Reads, admits, pairs, and diffs two path-backed visualization runs.
 * Layer identity comes from canonical manifest keys; payload paths never participate in pairing.
 */
export function diffPathVizRuns(args: {
  runDirA: string;
  runDirB: string;
  prefix?: string;
  dataTypeKey?: string;
}): PathVizRunDiff {
  const { runDirA, runDirB, prefix, dataTypeKey } = args;
  const manifestA = readPathVizManifest(runDirA);
  const manifestB = readPathVizManifest(runDirB);
  const comparison = pairComparableLayers({ manifestA, manifestB, prefix, dataTypeKey });
  const diffs = comparison.pairs.map(([left, right]) =>
    diffComparableLayerPair({
      runDirA,
      runDirB,
      manifestA,
      manifestB,
      left,
      right,
    })
  );

  return {
    runA: { runId: manifestA.runId, runDir: runDirA },
    runB: { runId: manifestB.runId, runDir: runDirB },
    filter: { prefix: prefix ?? null, dataTypeKey: dataTypeKey ?? null },
    unmatched: {
      left: comparison.unmatchedLeft,
      right: comparison.unmatchedRight,
    },
    diffs,
  };
}
