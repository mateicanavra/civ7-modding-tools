import {
  parseArgs,
  loadManifest,
  loadTraceLines,
  landmaskStats,
  connectedComponentsLandOddQ,
  hammingU8,
  pickLatestGridLayer,
  readU8Grid,
} from "./shared.js";

function lastSummary(trace: any[], kind: string): unknown {
  const matches = trace
    .filter((e) => e?.kind === "step.event" && e?.data?.kind === kind)
    .map((e) => e.data);
  return matches.at(-1) ?? null;
}
function tryPickLatestGridLayer(
  manifest: ReturnType<typeof loadManifest>,
  dataTypeKey: string
) {
  try {
    return pickLatestGridLayer(manifest, dataTypeKey);
  } catch {
    return null;
  }
}


function landmaskLayers(manifest: ReturnType<typeof loadManifest>) {
  return manifest.layers
    .filter((l) => l.kind === "grid" && l.dataTypeKey === "morphology.topography.landMask" && l.field?.format === "u8")
    .slice()
    .sort((a, b) => (a.stepIndex ?? 0) - (b.stepIndex ?? 0));
}

function summarizeLandmasks(runDir: string, manifest: ReturnType<typeof loadManifest>) {
  return landmaskLayers(manifest).map((layer) => {
    const grid = readU8Grid(runDir, layer);
    const basic = landmaskStats(grid.values);
    const cc = connectedComponentsLandOddQ(grid.values, grid.width, grid.height);
    return {
      stepId: layer.stepId,
      stepIndex: layer.stepIndex,
      dataTypeKey: layer.dataTypeKey,
      format: layer.field?.format ?? null,
      path: layer.field?.data?.path ?? null,
      ...basic,
      ...cc,
    };
  });
}

function countEqU8(values: Uint8Array, expected: number): number {
  const e = expected | 0;
  let n = 0;
  for (let i = 0; i < values.length; i++) {
    if (((values[i] ?? 0) | 0) === e) n++;
  }
  return n;
}

function maxU8(values: Uint8Array): number {
  let m = 0;
  for (let i = 0; i < values.length; i++) {
    const v = values[i] ?? 0;
    if (v > m) m = v;
  }
  return m;
}

function summarizeMountains(runDir: string, manifest: ReturnType<typeof loadManifest>) {
  // These keys are the stable, user-facing visualization outputs used in Mapgen Studio.
  const mountainMaskLayer = tryPickLatestGridLayer(manifest, "map.morphology.mountains.mountainMask");
  const hillMaskLayer = tryPickLatestGridLayer(manifest, "map.morphology.mountains.hillMask");
  const orogenyLayer = tryPickLatestGridLayer(manifest, "map.morphology.mountains.orogenyPotential");

  if (!mountainMaskLayer || !hillMaskLayer || !orogenyLayer) return null;

  const mountain = readU8Grid(runDir, mountainMaskLayer);
  const hill = readU8Grid(runDir, hillMaskLayer);
  const orogeny = readU8Grid(runDir, orogenyLayer);

  return {
    mountainTiles: countEqU8(mountain.values, 1),
    hillTiles: countEqU8(hill.values, 1),
    orogenyMax: maxU8(orogeny.values),
  };
}

function diffLandmasks(runDirA: string, runDirB: string, manifestA: ReturnType<typeof loadManifest>, manifestB: ReturnType<typeof loadManifest>) {
  const layersA = landmaskLayers(manifestA);
  const layersB = landmaskLayers(manifestB);
  const byStepA = new Map(layersA.map((l) => [l.stepId, l] as const));
  const byStepB = new Map(layersB.map((l) => [l.stepId, l] as const));

  const diffs: any[] = [];
  for (const [stepId, layerA] of byStepA.entries()) {
    const layerB = byStepB.get(stepId);
    if (!layerB) continue;
    const gridA = readU8Grid(runDirA, layerA);
    const gridB = readU8Grid(runDirB, layerB);
    const diff = hammingU8(gridA.values, gridB.values);
    diffs.push({
      stepId,
      stepIndexA: layerA.stepIndex,
      stepIndexB: layerB.stepIndex,
      hamming: diff,
      hammingPct: gridA.values.length > 0 ? diff / gridA.values.length : 0,
    });
  }
  return diffs;
}

/**
 * Dump analyzer (metrics-first).
 *
 * Usage:
 *   bun ./src/dev/diagnostics/analyze-dump.ts -- <runDirA> [runDirB]
 *
 * Output:
 *   JSON summary with land coherence metrics + optional hamming diffs.
 */
function main(): void {
  const { positionals } = parseArgs(process.argv.slice(2));
  const runDirA = positionals[0];
  const runDirB = positionals[1];
  if (!runDirA) throw new Error('Usage: bun ./src/dev/diagnostics/analyze-dump.ts -- <runDirA> [runDirB]');

  const manifestA = loadManifest(runDirA);
  const traceA = loadTraceLines(runDirA);

  const out: any = {
    runA: {
      runId: manifestA.runId,
      dir: runDirA,
      landmassSummary: lastSummary(traceA, "morphology.landmassPlates.summary"),
      geomorphologySummary: lastSummary(traceA, "morphology.geomorphology.summary"),
      landmasks: summarizeLandmasks(runDirA, manifestA),
      mountainsSummary: summarizeMountains(runDirA, manifestA),
    },
  };

  if (runDirB) {
    const manifestB = loadManifest(runDirB);
    const traceB = loadTraceLines(runDirB);
    out.runB = {
      runId: manifestB.runId,
      dir: runDirB,
      landmassSummary: lastSummary(traceB, "morphology.landmassPlates.summary"),
      geomorphologySummary: lastSummary(traceB, "morphology.geomorphology.summary"),
      landmasks: summarizeLandmasks(runDirB, manifestB),
      mountainsSummary: summarizeMountains(runDirB, manifestB),
    };
    out.diff = {
      landmaskLayerDiffs: diffLandmasks(runDirA, runDirB, manifestA, manifestB),
    };
  }

  console.log(JSON.stringify(out, null, 2));
}

try {
  main();
} catch (err) {
  console.error(err);
  process.exitCode = 1;
}
