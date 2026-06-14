#!/usr/bin/env bun

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import {
  type Civ7FeaturePlacementFeasibilityResult,
  type Civ7MapGridResult,
  type Civ7MapSummaryResult,
  type Civ7PlotSnapshotField,
  getCiv7FeaturePlacementFeasibility,
  getCiv7MapGrid,
  getCiv7MapSummary,
} from "@civ7/direct-control";
import {
  type FinalSurfaceParityProof,
  hashParityValue,
  stableParityProofStringify,
} from "../../src/dev/diagnostics/live-parity.js";
import {
  buildFeatureDeltaPlacementContexts,
  type FeatureDeltaPlacementContext,
} from "../../src/dev/diagnostics/surface-delta-context.js";

type Args = Readonly<{
  proofFile?: string;
  contextFile?: string;
  host?: string;
  port?: number;
  timeoutMs: number;
  maxCells: number;
  output?: string;
  help: boolean;
}>;

type FeatureFeasibilityProbe = Readonly<{
  ok: boolean;
  value: boolean | null;
  error: string | null;
}>;

const usage = `Usage:
  nx run mod-swooper-maps:verify -- --mode feature-delta-feasibility --proof-file <final-surface-proof.json>

Options:
  --context-file <path> Optional feature delta context artifact to join by plot index
  --host <host>       Civ7 tuner host
  --port <port>       Civ7 tuner port
  --timeout-ms <ms>   Direct-control timeout (default: 45000)
  --max-cells <n>     Safety cap for feature delta cells (default: 64)
  --output <path>     Write full proof JSON to path
`;

const LIVE_FEATURE_CONTEXT_FIELDS = [
  "terrain",
  "biome",
  "feature",
  "resource",
  "climate",
  "hydrology",
  "areaRegion",
  "tags",
  "owner",
] as const satisfies ReadonlyArray<Civ7PlotSnapshotField>;

function parseArgs(argv: string[]): Args {
  const args: {
    proofFile?: string;
    contextFile?: string;
    host?: string;
    port?: number;
    timeoutMs: number;
    maxCells: number;
    output?: string;
    help: boolean;
  } = {
    timeoutMs: 45_000,
    maxCells: 64,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const value = () => {
      const next = argv[index + 1];
      if (!next || next.startsWith("--")) throw new Error(`Missing value for ${arg}`);
      index += 1;
      return next;
    };
    switch (arg) {
      case "--help":
      case "-h":
        args.help = true;
        break;
      case "--proof-file":
        args.proofFile = value();
        break;
      case "--context-file":
        args.contextFile = value();
        break;
      case "--host":
        args.host = value();
        break;
      case "--port":
        args.port = parseInteger(value(), arg);
        break;
      case "--timeout-ms":
        args.timeoutMs = parseInteger(value(), arg);
        break;
      case "--max-cells":
        args.maxCells = parseInteger(value(), arg);
        break;
      case "--output":
        args.output = value();
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return args;
}

function parseInteger(value: string, label: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) throw new Error(`${label} must be an integer: ${value}`);
  return parsed;
}

async function main(): Promise<number> {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage);
    return 0;
  }
  if (!args.proofFile) throw new Error("Expected --proof-file");

  const proof = extractFinalSurfaceParityProof(JSON.parse(readFileSync(args.proofFile, "utf8")));
  const contextArtifact = args.contextFile
    ? JSON.parse(readFileSync(args.contextFile, "utf8"))
    : undefined;
  const contextRowsByPlot = readContextRowsByPlot(contextArtifact);
  const requestIdentity = resolveRequestIdentity(proof);
  if (requestIdentity.blockedBy.length > 0) {
    const outputWithoutHash = {
      ok: false,
      status: "blocked" as const,
      requestId: requestIdentity.requestId,
      sourceProofHash: hashParityValue(proof),
      blockedBy: requestIdentity.blockedBy,
      requestIdentity,
    };
    const output = { ...outputWithoutHash, proofHash: hashParityValue(outputWithoutHash) };
    writeOutput(args.output, output);
    console.log(stableParityProofStringify(output));
    return 2;
  }

  const runtimeIdentity = await readAndCompareRuntimeIdentity(proof, args);
  if (runtimeIdentity.blockedBy.length > 0) {
    const outputWithoutHash = {
      ok: false,
      status: "blocked" as const,
      requestId: requestIdentity.requestId,
      sourceProofHash: hashParityValue(proof),
      blockedBy: runtimeIdentity.blockedBy,
      requestIdentity,
      runtimeIdentity,
    };
    const output = { ...outputWithoutHash, proofHash: hashParityValue(outputWithoutHash) };
    writeOutput(args.output, output);
    console.log(stableParityProofStringify(output));
    return 2;
  }

  const deltaRows = buildFeatureDeltaPlacementContexts({ local: proof.local, live: proof.live });
  if (deltaRows.length === 0) throw new Error("Expected at least one feature delta row");
  if (deltaRows.length > args.maxCells) {
    throw new Error(
      `Feature delta row count ${deltaRows.length} exceeds --max-cells ${args.maxCells}`
    );
  }

  const livePlotContext = await getCiv7MapGrid(
    {
      locations: deltaRows.map((row) => ({ x: row.x, y: row.y })),
      fields: LIVE_FEATURE_CONTEXT_FIELDS,
      maxPlots: args.maxCells,
    },
    { host: args.host, port: args.port, timeoutMs: args.timeoutMs }
  );
  const cells = deltaRows.map((row) => ({
    x: row.x,
    y: row.y,
    featureTypes: uniqueNumbers([row.local.value, row.live.value]),
  }));
  const feasibility = await getCiv7FeaturePlacementFeasibility(
    { cells, maxCells: args.maxCells },
    { host: args.host, port: args.port, timeoutMs: args.timeoutMs }
  );

  const featureFeasibility = summarizeFeatureFeasibility(deltaRows, feasibility, contextRowsByPlot);
  const outputWithoutHash = {
    ok: true,
    requestId: requestIdentity.requestId,
    sourceProofHash: hashParityValue(proof),
    sourceContextHash: contextArtifact === undefined ? null : hashParityValue(contextArtifact),
    evidenceBoundary:
      "Diagnostic context only: TerrainBuilder.canHaveFeature readback is exact-runtime-bound evidence for feature delta source-authority classification. It does not authorize feature, natural-wonder, terrain, parity, product, or tuning closure by itself.",
    requestIdentity,
    runtimeIdentity,
    rowCount: deltaRows.length,
    livePlotContext: summarizeLivePlotContext(livePlotContext),
    featureFeasibility,
  };
  const output = { ...outputWithoutHash, proofHash: hashParityValue(outputWithoutHash) };
  writeOutput(args.output, output);
  console.log(stableParityProofStringify(output));
  return 0;
}

function extractFinalSurfaceParityProof(payload: unknown): FinalSurfaceParityProof {
  if (!isRecord(payload)) throw new Error("Proof payload must be an object");
  const proof = isRecord(payload.proof) ? payload.proof : payload;
  if (!isRecord(proof.local) || !isRecord(proof.live)) {
    throw new Error("Expected final-surface parity proof with local/live snapshots");
  }
  return proof as FinalSurfaceParityProof;
}

function resolveRequestIdentity(proof: FinalSurfaceParityProof) {
  const packet = isRecord(proof.exactAuthorshipPacket) ? proof.exactAuthorshipPacket : {};
  const sourceSnapshot = isRecord(packet.sourceSnapshot) ? packet.sourceSnapshot : {};
  const log = isRecord(packet.log) ? packet.log : {};
  const sources = {
    exactAuthorshipSummary: stringValue(recordValue(proof.exactAuthorshipSummary, "requestId")),
    exactAuthorshipPacket: stringValue(packet.requestId),
    sourceSnapshot: stringValue(sourceSnapshot.requestId),
    log: stringValue(log.requestId),
  };
  const values = Object.values(sources).filter((value): value is string => value !== undefined);
  const uniqueValues = [...new Set(values)].sort((left, right) => left.localeCompare(right));
  const blockedBy =
    uniqueValues.length === 0
      ? ["request-identity.missing"]
      : uniqueValues.length > 1
        ? ["request-identity.conflict"]
        : [];
  return {
    requestId: uniqueValues.length === 1 ? uniqueValues[0] : undefined,
    status: blockedBy.length === 0 ? ("matched" as const) : ("blocked" as const),
    blockedBy,
    sources,
  };
}

async function readAndCompareRuntimeIdentity(
  proof: FinalSurfaceParityProof,
  args: Pick<Args, "host" | "port" | "timeoutMs">
) {
  const current = await getCiv7MapSummary({
    host: args.host,
    port: args.port,
    timeoutMs: args.timeoutMs,
  });
  const saved = savedRuntimeIdentity(proof);
  const observed = observedRuntimeIdentity(current);
  const comparisons = {
    width: compareIdentityValue(saved.width, observed.width),
    height: compareIdentityValue(saved.height, observed.height),
    plotCount: compareIdentityValue(saved.plotCount, observed.plotCount),
    seed: compareIdentityValue(saved.seed, observed.seed),
    turn: compareIdentityValue(saved.turn, observed.turn),
    gameHash: compareIdentityValue(saved.gameHash, observed.gameHash),
  };
  const blockedBy = Object.entries(comparisons)
    .filter(([, comparison]) => comparison.status !== "matched")
    .map(([key, comparison]) => `runtime-identity.${key}.${comparison.status}`)
    .sort((left, right) => left.localeCompare(right));

  return {
    status: blockedBy.length === 0 ? ("matched" as const) : ("blocked" as const),
    blockedBy,
    saved,
    observed,
    comparisons,
  };
}

function savedRuntimeIdentity(proof: FinalSurfaceParityProof) {
  const evidence = isRecord(proof.live.evidence) ? proof.live.evidence : {};
  const runtime = isRecord(evidence.runtime) ? evidence.runtime : {};
  const fullGrid = isRecord(evidence.fullGrid) ? evidence.fullGrid : {};
  const initialSummary = isRecord(fullGrid.initialSummary) ? fullGrid.initialSummary : {};
  return {
    width: numberValue(runtime.width) ?? numberValue(initialSummary.width) ?? proof.live.width,
    height: numberValue(runtime.height) ?? numberValue(initialSummary.height) ?? proof.live.height,
    plotCount: numberValue(runtime.plotCount) ?? numberValue(initialSummary.plotCount),
    seed: numberValue(runtime.seed) ?? numberValue(initialSummary.seed) ?? proof.live.seed,
    turn: numberValue(runtime.turn) ?? numberValue(initialSummary.turn),
    gameHash: numberValue(runtime.gameHash) ?? numberValue(initialSummary.gameHash),
  };
}

function observedRuntimeIdentity(summary: Civ7MapSummaryResult) {
  return {
    host: summary.host,
    port: summary.port,
    state: summary.state,
    width: probeNumber(summary.map.width),
    height: probeNumber(summary.map.height),
    plotCount: probeNumber(summary.map.plotCount),
    seed: probeNumber(summary.map.randomSeed),
    turn: probeNumber(summary.game.turn),
    gameHash: probeNumber(summary.game.hash),
  };
}

function compareIdentityValue(saved: number | undefined, observed: number | undefined) {
  if (saved === undefined) return { status: "missing-saved" as const, saved, observed };
  if (observed === undefined) return { status: "missing-observed" as const, saved, observed };
  if (saved !== observed) return { status: "mismatch" as const, saved, observed };
  return { status: "matched" as const, saved, observed };
}

function summarizeLivePlotContext(readback: Civ7MapGridResult) {
  return {
    readback: {
      host: readback.host,
      port: readback.port,
      state: readback.state,
      fields: readback.fields,
      plotCount: readback.plotCount,
      omitted: readback.omitted,
      hiddenInfoPolicy: readback.hiddenInfoPolicy,
    },
    rows: readback.plots.map((plot) => ({
      location: plot.location,
      hiddenInfoPolicy: plot.hiddenInfoPolicy,
      facts: plot.facts,
    })),
  };
}

function summarizeFeatureFeasibility(
  rows: ReadonlyArray<FeatureDeltaPlacementContext>,
  readback: Civ7FeaturePlacementFeasibilityResult,
  contextRowsByPlot: ReadonlyMap<number, Record<string, unknown>>
) {
  const cellsByLocation = new Map(
    readback.cells.map((cell) => [`${cell.location.x},${cell.location.y}`, cell] as const)
  );
  const summarizedRows = rows.map((row) => {
    const cell = cellsByLocation.get(`${row.x},${row.y}`);
    const localFeasibleInCiv =
      row.local.value === null ? null : readFeatureFeasibilityProbe(cell, row.local.value);
    const liveFeasibleInCiv =
      row.live.value === null ? null : readFeatureFeasibilityProbe(cell, row.live.value);
    const contextRow = contextRowsByPlot.get(row.plotIndex);
    return {
      x: row.x,
      y: row.y,
      plotIndex: row.plotIndex,
      localFeature: row.local,
      liveFeature: row.live,
      localContext: row.local.context,
      liveContext: row.live.context,
      evidenceClass: row.evidenceClass,
      localFeatureIntent: contextRow?.localFeatureIntent ?? row.localFeatureIntent,
      naturalWonderFootprint: contextRow?.naturalWonderFootprint ?? row.naturalWonderFootprint,
      pairedSameFeatureDelta: row.pairedSameFeatureDelta,
      localFeasibleInCiv,
      liveFeasibleInCiv,
      feasibilityClass: classifyFeatureFeasibility({
        evidenceClass: row.evidenceClass,
        localFeasibleInCiv,
        liveFeasibleInCiv,
      }),
    };
  });
  return {
    readback: {
      host: readback.host,
      port: readback.port,
      state: readback.state,
      cellCount: readback.cellCount,
      omittedCells: readback.omittedCells,
    },
    classCounts: countBy(summarizedRows, (row) => row.feasibilityClass),
    evidenceAndFeasibilityCounts: countBy(
      summarizedRows,
      (row) =>
        `${row.evidenceClass}|local:${feasibilityValue(row.localFeasibleInCiv)}|live:${feasibilityValue(row.liveFeasibleInCiv)}`
    ),
    rows: summarizedRows,
  };
}

function readContextRowsByPlot(payload: unknown): ReadonlyMap<number, Record<string, unknown>> {
  const byPlot = new Map<number, Record<string, unknown>>();
  if (!isRecord(payload) || !Array.isArray(payload.rows)) return byPlot;
  for (const row of payload.rows) {
    if (!isRecord(row)) continue;
    const plotIndex = numberValue(row.plotIndex);
    if (plotIndex === undefined) continue;
    byPlot.set(plotIndex, row);
  }
  return byPlot;
}

function readFeatureFeasibilityProbe(
  cell: Civ7FeaturePlacementFeasibilityResult["cells"][number] | undefined,
  featureType: number
): FeatureFeasibilityProbe {
  const probe = cell?.feasibility[String(featureType)];
  if (probe === undefined) return { ok: false, value: null, error: "missing-probe" };
  const ok = probe.ok === true;
  return {
    ok,
    value: ok && typeof probe.value === "boolean" ? probe.value : null,
    error: typeof probe.error === "string" ? probe.error : ok ? null : "probe-failed",
  };
}

function classifyFeatureFeasibility(args: {
  evidenceClass: FeatureDeltaPlacementContext["evidenceClass"];
  localFeasibleInCiv: FeatureFeasibilityProbe | null;
  liveFeasibleInCiv: FeatureFeasibilityProbe | null;
}): string {
  const local = args.localFeasibleInCiv;
  const live = args.liveFeasibleInCiv;
  if ((local !== null && !local.ok) || (live !== null && !live.ok)) return "feasibility-missing";
  if (args.evidenceClass === "local-only-ecology-feature") {
    if (local?.value === true) return "local-feature-civ-feasible-live-empty";
    if (local?.value === false) return "local-feature-civ-infeasible-live-empty";
  }
  if (args.evidenceClass === "live-only-ecology-feature") {
    if (live?.value === true) return "live-feature-civ-feasible-local-empty";
    if (live?.value === false) return "live-feature-civ-infeasible-local-empty";
  }
  if (
    args.evidenceClass === "natural-wonder-offset-local-anchor" ||
    args.evidenceClass === "natural-wonder-offset-live-anchor"
  ) {
    if (local?.value === true && live?.value === true)
      return "natural-wonder-offset-both-civ-feasible";
    if (local?.value === true && live === null) return "natural-wonder-offset-local-civ-feasible";
    if (local === null && live?.value === true) return "natural-wonder-offset-live-civ-feasible";
    if (local?.value === false && live === null)
      return "natural-wonder-offset-local-civ-infeasible";
    if (local === null && live?.value === false) return "natural-wonder-offset-live-civ-infeasible";
    if (local?.value === false && live?.value === false)
      return "natural-wonder-offset-both-civ-infeasible";
  }
  return "unclassified";
}

function uniqueNumbers(values: ReadonlyArray<number | null>): ReadonlyArray<number> {
  return [...new Set(values.filter((value): value is number => typeof value === "number"))];
}

function countBy<T>(
  values: ReadonlyArray<T>,
  keyFor: (value: T) => string
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const value of values) {
    const key = keyFor(value);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return Object.fromEntries(
    Object.entries(counts).sort(([left], [right]) => left.localeCompare(right))
  );
}

function feasibilityValue(probe: FeatureFeasibilityProbe | null): string {
  if (probe === null) return "not-applicable";
  if (!probe.ok) return `error:${probe.error ?? "unknown"}`;
  return probe.value === true ? "true" : "false";
}

function writeOutput(path: string | undefined, output: unknown): void {
  if (!path) return;
  const absolute = resolve(path);
  mkdirSync(dirname(absolute), { recursive: true });
  writeFileSync(absolute, `${stableParityProofStringify(output)}\n`);
}

function probeNumber(value: unknown): number | undefined {
  if (isRecord(value) && value.ok === true && typeof value.value === "number") return value.value;
  return undefined;
}

function numberValue(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function recordValue(value: unknown, key: string): unknown {
  return isRecord(value) ? value[key] : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
