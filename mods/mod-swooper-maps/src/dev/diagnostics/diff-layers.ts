import { parseArgs, loadManifest, listLayers, readU8Grid, readI16Grid, readF32Grid, hammingU8 } from "./shared.js";

type DiffRow = Readonly<{
  dataTypeKey: string;
  variantKey?: string | null;
  stepIdA: string;
  stepIdB: string;
  format: string | null;
  hamming?: number;
  hammingPct?: number;
  maxAbsDiff?: number;
  note?: string;
}>;

function pickComparablePairs(args: {
  manifestA: ReturnType<typeof loadManifest>;
  manifestB: ReturnType<typeof loadManifest>;
  prefix?: string;
  dataTypeKey?: string;
}): Array<[any, any]> {
  const { manifestA, manifestB } = args;
  const rowsA = listLayers(manifestA, { prefix: args.prefix, dataTypeKey: args.dataTypeKey });
  const rowsB = listLayers(manifestB, { prefix: args.prefix, dataTypeKey: args.dataTypeKey });

  // Pair by `path` too: a single (dataTypeKey, stepId, variantKey) can be dumped in multiple
  // representations (e.g. different roles), and collapsing would yield false diffs.
  const keyOf = (r: any): string =>
    `${r.dataTypeKey}::${r.stepId}::${r.variantKey ?? ""}::${r.path ?? ""}`;
  const byKeyB = new Map(rowsB.map((r: any) => [keyOf(r), r] as const));
  const out: Array<[any, any]> = [];
  for (const rA of rowsA) {
    const rB = byKeyB.get(keyOf(rA));
    if (rB) out.push([rA, rB]);
  }
  return out;
}

/**
 * Diff layer binaries between two runs for u8/i16 grids.
 *
 * Usage:
 *   bun ./src/dev/diagnostics/diff-layers.ts -- <runDirA> <runDirB> [--prefix morphology.topography] [--dataTypeKey morphology.topography.landMask]
 */
function main(): void {
  const { positionals, flags } = parseArgs(process.argv.slice(2));
  const runDirA = positionals[0];
  const runDirB = positionals[1];
  if (!runDirA || !runDirB) {
    throw new Error("Usage: bun ./src/dev/diagnostics/diff-layers.ts -- <runDirA> <runDirB> [--prefix ...]");
  }

  const manifestA = loadManifest(runDirA);
  const manifestB = loadManifest(runDirB);
  const prefix = typeof flags.prefix === "string" ? flags.prefix : undefined;
  const dataTypeKey = typeof flags.dataTypeKey === "string" ? flags.dataTypeKey : undefined;

  const pairs = pickComparablePairs({ manifestA, manifestB, prefix, dataTypeKey });
  const diffs: DiffRow[] = [];

  for (const [a, b] of pairs) {
    const format = a.format ?? null;
    const variantKey = a.variantKey ?? null;
    if (format === "u8") {
      const layerA = manifestA.layers.find(
        (l) =>
          l.stepId === a.stepId &&
          l.dataTypeKey === a.dataTypeKey &&
          (l.variantKey ?? null) === variantKey &&
          l.field?.data?.path === a.path
      );
      const layerB = manifestB.layers.find(
        (l) =>
          l.stepId === b.stepId &&
          l.dataTypeKey === b.dataTypeKey &&
          (l.variantKey ?? null) === variantKey &&
          l.field?.data?.path === b.path
      );
      if (!layerA || !layerB) continue;
      const gA = readU8Grid(runDirA, layerA);
      const gB = readU8Grid(runDirB, layerB);
      if (gA.values.length !== gB.values.length) {
        diffs.push({
          dataTypeKey: a.dataTypeKey,
          variantKey,
          stepIdA: a.stepId,
          stepIdB: b.stepId,
          format,
          note: "length mismatch",
        });
        continue;
      }
      const ham = hammingU8(gA.values, gB.values);
      diffs.push({
        dataTypeKey: a.dataTypeKey,
        variantKey,
        stepIdA: a.stepId,
        stepIdB: b.stepId,
        format,
        hamming: ham,
        hammingPct: gA.values.length > 0 ? ham / gA.values.length : 0,
      });
      continue;
    }
    if (format === "i16") {
      const layerA = manifestA.layers.find(
        (l) =>
          l.stepId === a.stepId &&
          l.dataTypeKey === a.dataTypeKey &&
          (l.variantKey ?? null) === variantKey &&
          l.field?.data?.path === a.path
      );
      const layerB = manifestB.layers.find(
        (l) =>
          l.stepId === b.stepId &&
          l.dataTypeKey === b.dataTypeKey &&
          (l.variantKey ?? null) === variantKey &&
          l.field?.data?.path === b.path
      );
      if (!layerA || !layerB) continue;
      const gA = readI16Grid(runDirA, layerA);
      const gB = readI16Grid(runDirB, layerB);
      if (gA.values.length !== gB.values.length) {
        diffs.push({
          dataTypeKey: a.dataTypeKey,
          variantKey,
          stepIdA: a.stepId,
          stepIdB: b.stepId,
          format,
          note: "length mismatch",
        });
        continue;
      }
      let diff = 0;
      for (let i = 0; i < gA.values.length; i++) if (gA.values[i] !== gB.values[i]) diff++;
      diffs.push({
        dataTypeKey: a.dataTypeKey,
        variantKey,
        stepIdA: a.stepId,
        stepIdB: b.stepId,
        format,
        hamming: diff,
        hammingPct: gA.values.length > 0 ? diff / gA.values.length : 0,
      });
      continue;
    }
    if (format === "f32") {
      const layerA = manifestA.layers.find(
        (l) =>
          l.stepId === a.stepId &&
          l.dataTypeKey === a.dataTypeKey &&
          (l.variantKey ?? null) === variantKey &&
          l.field?.data?.path === a.path
      );
      const layerB = manifestB.layers.find(
        (l) =>
          l.stepId === b.stepId &&
          l.dataTypeKey === b.dataTypeKey &&
          (l.variantKey ?? null) === variantKey &&
          l.field?.data?.path === b.path
      );
      if (!layerA || !layerB) continue;
      const gA = readF32Grid(runDirA, layerA);
      const gB = readF32Grid(runDirB, layerB);
      if (gA.values.length !== gB.values.length) {
        diffs.push({
          dataTypeKey: a.dataTypeKey,
          variantKey,
          stepIdA: a.stepId,
          stepIdB: b.stepId,
          format,
          note: "length mismatch",
        });
        continue;
      }
      let diff = 0;
      let maxAbsDiff = 0;
      for (let i = 0; i < gA.values.length; i++) {
        const va = gA.values[i]!;
        const vb = gB.values[i]!;
        if (Object.is(va, vb)) continue;
        if (Number.isNaN(va) && Number.isNaN(vb)) continue;
        diff++;
        const abs = Math.abs(va - vb);
        if (abs > maxAbsDiff) maxAbsDiff = abs;
      }
      diffs.push({
        dataTypeKey: a.dataTypeKey,
        variantKey,
        stepIdA: a.stepId,
        stepIdB: b.stepId,
        format,
        hamming: diff,
        hammingPct: gA.values.length > 0 ? diff / gA.values.length : 0,
        maxAbsDiff,
      });
      continue;
    }

    diffs.push({
      dataTypeKey: a.dataTypeKey,
      variantKey,
      stepIdA: a.stepId,
      stepIdB: b.stepId,
      format,
      note: "format not diffed (supported: u8, i16, f32)",
    });
  }

  console.log(
    JSON.stringify(
      {
        runA: { runId: manifestA.runId, runDir: runDirA },
        runB: { runId: manifestB.runId, runDir: runDirB },
        filter: { prefix: prefix ?? null, dataTypeKey: dataTypeKey ?? null },
        diffs,
      },
      null,
      2
    )
  );
}

try {
  main();
} catch (err) {
  console.error(err);
  process.exitCode = 1;
}
