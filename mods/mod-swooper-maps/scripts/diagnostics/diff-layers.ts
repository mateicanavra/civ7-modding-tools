import { parseDiagnosticArgs } from "./command-input.js";
import { hammingU8, listLayers, readF32Grid, readI16Grid, readU8Grid } from "./grid-analysis.js";
import { loadPathVizManifest } from "./serialized-evidence.js";

export type DiffRow = Readonly<{
  layerKey: string;
  dataTypeKey: string;
  variantKey?: string | null;
  stepIdA: string;
  stepIdB: string;
  format: string | null;
  hamming?: number;
  hammingPct?: number;
  maxAbsDiff?: number;
  nonFiniteMismatchCount?: number;
  note?: string;
}>;

type Manifest = ReturnType<typeof loadPathVizManifest>;
type LayerRow = ReturnType<typeof listLayers>[number];
type GridLayer = Extract<Manifest["layers"][number], { kind: "grid" }>;

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
  const rowsA = listLayers(manifestA, { prefix: args.prefix, dataTypeKey: args.dataTypeKey });
  const rowsB = listLayers(manifestB, { prefix: args.prefix, dataTypeKey: args.dataTypeKey });

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

function diffIdentity(left: LayerRow, right: LayerRow): Omit<DiffRow, "note"> {
  return {
    layerKey: left.layerKey,
    dataTypeKey: left.dataTypeKey,
    variantKey: left.variantKey ?? null,
    stepIdA: left.stepId,
    stepIdB: right.stepId,
    format: left.format ?? null,
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
}): DiffRow {
  const { runDirA, runDirB, manifestA, manifestB, left, right } = args;
  const identity = diffIdentity(left, right);

  if (left.kind === "grid" && right.kind === "grid") {
    const leftDims = left.dims;
    const rightDims = right.dims;
    if (!leftDims || !rightDims) {
      throw new Error(`Missing paired grid dimensions for "${left.layerKey}".`);
    }
    if (leftDims.width !== rightDims.width || leftDims.height !== rightDims.height) {
      return {
        ...identity,
        note:
          `dimension mismatch: ${leftDims.width}x${leftDims.height} vs ` +
          `${rightDims.width}x${rightDims.height}`,
      };
    }
  }

  if (left.format !== right.format) {
    return {
      ...identity,
      note: `format mismatch: ${String(left.format)} vs ${String(right.format)}`,
    };
  }

  if (identity.format === "u8") {
    const leftGrid = readU8Grid(runDirA, requireGridLayer(manifestA, left));
    const rightGrid = readU8Grid(runDirB, requireGridLayer(manifestB, right));
    if (leftGrid.values.length !== rightGrid.values.length) {
      return { ...identity, note: "length mismatch" };
    }
    const hamming = hammingU8(leftGrid.values, rightGrid.values);
    return {
      ...identity,
      hamming,
      hammingPct: leftGrid.values.length > 0 ? hamming / leftGrid.values.length : 0,
    };
  }

  if (identity.format === "i16") {
    const leftGrid = readI16Grid(runDirA, requireGridLayer(manifestA, left));
    const rightGrid = readI16Grid(runDirB, requireGridLayer(manifestB, right));
    if (leftGrid.values.length !== rightGrid.values.length) {
      return { ...identity, note: "length mismatch" };
    }
    let hamming = 0;
    for (let index = 0; index < leftGrid.values.length; index++) {
      if (leftGrid.values[index] !== rightGrid.values[index]) hamming++;
    }
    return {
      ...identity,
      hamming,
      hammingPct: leftGrid.values.length > 0 ? hamming / leftGrid.values.length : 0,
    };
  }

  if (identity.format === "f32") {
    const leftGrid = readF32Grid(runDirA, requireGridLayer(manifestA, left));
    const rightGrid = readF32Grid(runDirB, requireGridLayer(manifestB, right));
    if (leftGrid.values.length !== rightGrid.values.length) {
      return { ...identity, note: "length mismatch" };
    }
    let hamming = 0;
    let nonFiniteMismatchCount = 0;
    let maxAbsDiff: number | undefined;
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
        maxAbsDiff === undefined ? absoluteDifference : Math.max(maxAbsDiff, absoluteDifference);
    }
    return {
      ...identity,
      hamming,
      hammingPct: leftGrid.values.length > 0 ? hamming / leftGrid.values.length : 0,
      nonFiniteMismatchCount,
      ...(maxAbsDiff === undefined ? {} : { maxAbsDiff }),
    };
  }

  return {
    ...identity,
    note: "format not diffed (supported: u8, i16, f32)",
  };
}

/**
 * Diff layer binaries between two runs for u8/i16 grids.
 *
 * Usage:
 *   bun ./scripts/diagnostics/diff-layers.ts -- <runDirA> <runDirB> [--prefix morphology.topography] [--dataTypeKey morphology.topography.landMask]
 */
function main(): void {
  const { positionals, flags } = parseDiagnosticArgs(process.argv.slice(2));
  const runDirA = positionals[0];
  const runDirB = positionals[1];
  if (!runDirA || !runDirB) {
    throw new Error(
      "Usage: bun ./scripts/diagnostics/diff-layers.ts -- <runDirA> <runDirB> [--prefix ...]"
    );
  }

  const manifestA = loadPathVizManifest(runDirA);
  const manifestB = loadPathVizManifest(runDirB);
  const prefix = typeof flags.prefix === "string" ? flags.prefix : undefined;
  const dataTypeKey = typeof flags.dataTypeKey === "string" ? flags.dataTypeKey : undefined;

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

  console.log(
    JSON.stringify(
      {
        runA: { runId: manifestA.runId, runDir: runDirA },
        runB: { runId: manifestB.runId, runDir: runDirB },
        filter: { prefix: prefix ?? null, dataTypeKey: dataTypeKey ?? null },
        unmatched: {
          left: comparison.unmatchedLeft,
          right: comparison.unmatchedRight,
        },
        diffs,
      },
      null,
      2
    )
  );
}

if (import.meta.main) {
  try {
    main();
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  }
}
