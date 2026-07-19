import {
  hammingU8,
  isTraceDataRecordEvent,
  MissingGridLayerError,
  pickLatestGridLayer,
  readPathVizManifest,
  readTraceEvents,
  readU8Grid,
} from "@swooper/mapgen-diagnostics";
import { parseDiagnosticArgs } from "./command-input.js";
import { connectedComponentsLandOddQ, landmaskStats } from "./map-analysis.js";

function lastSummary(trace: ReturnType<typeof readTraceEvents>, kind: string): unknown {
  const matches = trace
    .filter(isTraceDataRecordEvent)
    .filter((event) => event.data.kind === kind)
    .map((event) => event.data);
  return matches.at(-1) ?? null;
}
function tryPickLatestGridLayer(
  manifest: ReturnType<typeof readPathVizManifest>,
  dataTypeKey: string
) {
  try {
    return pickLatestGridLayer(manifest, { dataTypeKey });
  } catch (error) {
    if (error instanceof MissingGridLayerError) return null;
    throw error;
  }
}

function landmaskLayers(manifest: ReturnType<typeof readPathVizManifest>) {
  return manifest.layers
    .filter(
      (layer): layer is ReturnType<typeof pickLatestGridLayer> =>
        layer.kind === "grid" &&
        layer.dataTypeKey === "morphology.topography.landMask" &&
        layer.field.format === "u8"
    )
    .slice()
    .sort((a, b) => (a.stepIndex ?? 0) - (b.stepIndex ?? 0));
}

function summarizeLandmasks(runDir: string, manifest: ReturnType<typeof readPathVizManifest>) {
  return landmaskLayers(manifest).map((layer) => {
    const grid = readU8Grid(runDir, layer);
    const basic = landmaskStats(grid.values);
    const cc = connectedComponentsLandOddQ(grid.values, grid.width, grid.height);
    return {
      stepId: layer.stepId,
      stepIndex: layer.stepIndex,
      dataTypeKey: layer.dataTypeKey,
      format: layer.field.format,
      path: layer.field.data.path,
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

function summarizeMountains(runDir: string, manifest: ReturnType<typeof readPathVizManifest>) {
  // These keys are the stable, user-facing visualization outputs used in Mapgen Studio.
  const mountainMaskLayer = tryPickLatestGridLayer(
    manifest,
    "map.morphology.mountains.mountainMask"
  );
  const hillMaskLayer = tryPickLatestGridLayer(manifest, "map.morphology.mountains.hillMask");
  const orogenyLayer = tryPickLatestGridLayer(
    manifest,
    "map.morphology.mountains.orogenyPotential"
  );

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

function diffLandmasks(
  runDirA: string,
  runDirB: string,
  manifestA: ReturnType<typeof readPathVizManifest>,
  manifestB: ReturnType<typeof readPathVizManifest>
) {
  const layersA = landmaskLayers(manifestA);
  const layersB = landmaskLayers(manifestB);
  const byStepA = new Map(layersA.map((l) => [l.stepId, l] as const));
  const byStepB = new Map(layersB.map((l) => [l.stepId, l] as const));

  const diffs: Array<
    Readonly<{
      stepId: string;
      stepIndexA: number;
      stepIndexB: number;
      hamming: number;
      hammingPct: number;
    }>
  > = [];
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
 *   bun ./scripts/diagnostics/analyze-dump.ts -- <runDirA> [runDirB]
 *
 * Output:
 *   JSON summary with land coherence metrics + optional hamming diffs.
 */
function main(): void {
  const { positionals } = parseDiagnosticArgs(process.argv.slice(2));
  const runDirA = positionals[0];
  const runDirB = positionals[1];
  if (!runDirA)
    throw new Error("Usage: bun ./scripts/diagnostics/analyze-dump.ts -- <runDirA> [runDirB]");

  const manifestA = readPathVizManifest(runDirA);
  const traceA = readTraceEvents(runDirA);

  const out: Record<string, unknown> = {
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
    const manifestB = readPathVizManifest(runDirB);
    const traceB = readTraceEvents(runDirB);
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
