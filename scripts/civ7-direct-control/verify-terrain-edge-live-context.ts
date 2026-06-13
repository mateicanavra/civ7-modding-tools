#!/usr/bin/env bun

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import {
  type FinalSurfaceParityProof,
  hashParityValue,
  stableParityProofStringify,
} from "../../mods/mod-swooper-maps/src/dev/diagnostics/live-parity.ts";
import {
  buildTerrainDeltaEdgeContexts,
  type TerrainDeltaEdgeContext,
} from "../../mods/mod-swooper-maps/src/dev/diagnostics/surface-delta-context.ts";
import {
  type Civ7MapGridResult,
  type Civ7MapSummaryResult,
  type Civ7PlotSnapshot,
  type Civ7PlotSnapshotField,
  getCiv7MapGrid,
  getCiv7MapSummary,
} from "../../packages/civ7-direct-control/src/index.ts";

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

const usage = `Usage:
  bun scripts/civ7-direct-control/verify-terrain-edge-live-context.ts --proof-file <final-surface-proof.json>

Options:
  --context-file <path> Optional terrain edge context artifact to join by plot index
  --host <host>       Civ7 tuner host
  --port <port>       Civ7 tuner port
  --timeout-ms <ms>   Direct-control timeout (default: 45000)
  --max-cells <n>     Safety cap for terrain delta cells (default: 16)
  --output <path>     Write full proof JSON to path
`;

const LIVE_TERRAIN_EDGE_FIELDS = [
  "terrain",
  "hydrology",
  "areaRegion",
] as const satisfies ReadonlyArray<Civ7PlotSnapshotField>;

const REQUIRED_LIVE_TERRAIN_EDGE_FACTS = [
  "terrain",
  "water",
  "lake",
  "riverType",
  "areaId",
  "regionId",
  "landmassId",
] as const;

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
    maxCells: 16,
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
      sourceContextHash: contextArtifact === undefined ? null : hashParityValue(contextArtifact),
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
      sourceContextHash: contextArtifact === undefined ? null : hashParityValue(contextArtifact),
      blockedBy: runtimeIdentity.blockedBy,
      requestIdentity,
      runtimeIdentity,
    };
    const output = { ...outputWithoutHash, proofHash: hashParityValue(outputWithoutHash) };
    writeOutput(args.output, output);
    console.log(stableParityProofStringify(output));
    return 2;
  }

  const terrainRows = buildTerrainDeltaEdgeContexts({ local: proof.local, live: proof.live });
  if (terrainRows.length === 0) throw new Error("Expected at least one terrain edge delta row");
  if (terrainRows.length > args.maxCells) {
    throw new Error(
      `Terrain edge row count ${terrainRows.length} exceeds --max-cells ${args.maxCells}`
    );
  }

  const livePlotContext = await getCiv7MapGrid(
    {
      locations: terrainRows.map((row) => ({ x: row.x, y: row.y })),
      fields: LIVE_TERRAIN_EDGE_FIELDS,
      maxPlots: args.maxCells,
    },
    { host: args.host, port: args.port, timeoutMs: args.timeoutMs }
  );
  const completeness = summarizeTerrainEdgeReadbackCompleteness(terrainRows, livePlotContext);
  if (completeness.blockedBy.length > 0) {
    const outputWithoutHash = {
      ok: false,
      status: "blocked" as const,
      requestId: requestIdentity.requestId,
      sourceProofHash: hashParityValue(proof),
      sourceContextHash: contextArtifact === undefined ? null : hashParityValue(contextArtifact),
      blockedBy: completeness.blockedBy,
      requestIdentity,
      runtimeIdentity,
      livePlotContext: summarizeLivePlotContext(livePlotContext),
      completeness,
    };
    const output = { ...outputWithoutHash, proofHash: hashParityValue(outputWithoutHash) };
    writeOutput(args.output, output);
    console.log(stableParityProofStringify(output));
    return 2;
  }

  const outputWithoutHash = {
    ok: true,
    status: "complete" as const,
    requestId: requestIdentity.requestId,
    sourceProofHash: hashParityValue(proof),
    sourceContextHash: contextArtifact === undefined ? null : hashParityValue(contextArtifact),
    evidenceBoundary:
      "Diagnostic context only: live terrain/hydrology/area readback is exact-runtime-bound evidence for terrain edge source-authority classification. It does not authorize terrain repair, parity closure, product acceptance, or tuning by itself.",
    requestIdentity,
    runtimeIdentity,
    rowCount: terrainRows.length,
    livePlotContext: summarizeLivePlotContext(livePlotContext),
    rows: summarizeRows(terrainRows, livePlotContext, contextRowsByPlot),
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

export function summarizeTerrainEdgeReadbackCompleteness(
  rows: ReadonlyArray<TerrainDeltaEdgeContext>,
  readback: Civ7MapGridResult
) {
  const plotsByLocation = plotsByLocationKey(readback.plots);
  const missingRows = rows.filter((row) => !plotsByLocation.has(locationKey(row.x, row.y)));
  const factIssues = rows.flatMap((row) => {
    const plot = plotsByLocation.get(locationKey(row.x, row.y));
    if (plot === undefined) return [];
    return REQUIRED_LIVE_TERRAIN_EDGE_FACTS.flatMap((field) => {
      const fact = plot.facts[field];
      if (fact === undefined) {
        return [
          {
            x: row.x,
            y: row.y,
            plotIndex: row.plotIndex,
            field,
            status: "missing" as const,
            link: `live-terrain-readback.${field}.missing`,
          },
        ];
      }
      if (!isRecord(fact) || fact.ok !== true || !("value" in fact) || fact.value === undefined) {
        return [
          {
            x: row.x,
            y: row.y,
            plotIndex: row.plotIndex,
            field,
            status: "failed" as const,
            link: `live-terrain-readback.${field}.failed`,
            fact,
          },
        ];
      }
      return [];
    });
  });
  const blockedBy = [
    ...(readback.omitted > 0 ? ["live-terrain-readback.omitted"] : []),
    ...(missingRows.length > 0 ? ["live-terrain-readback.missing-rows"] : []),
    ...factIssues.map((issue) => issue.link),
  ]
    .filter((link, index, links) => links.indexOf(link) === index)
    .sort((left, right) => left.localeCompare(right));
  return {
    status: blockedBy.length === 0 ? ("complete" as const) : ("blocked" as const),
    blockedBy,
    expectedRows: rows.length,
    observedRows: readback.plots.length,
    omitted: readback.omitted,
    missingRows: missingRows.map((row) => ({ x: row.x, y: row.y, plotIndex: row.plotIndex })),
    factIssues,
  };
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

function summarizeRows(
  rows: ReadonlyArray<TerrainDeltaEdgeContext>,
  readback: Civ7MapGridResult,
  contextRowsByPlot: ReadonlyMap<number, Record<string, unknown>>
) {
  const plotsByLocation = plotsByLocationKey(readback.plots);
  return rows.map((row) => {
    const plot = plotsByLocation.get(locationKey(row.x, row.y));
    const contextRow = contextRowsByPlot.get(row.plotIndex);
    return {
      x: row.x,
      y: row.y,
      plotIndex: row.plotIndex,
      localTerrain: row.localTerrain,
      liveTerrain: row.liveTerrain,
      evidenceClass: row.evidenceClass,
      neighborhood: row.neighborhood,
      localProjection: contextRow?.localProjection ?? row.localProjection ?? null,
      liveReadback:
        plot === undefined
          ? null
          : {
              location: plot.location,
              hiddenInfoPolicy: plot.hiddenInfoPolicy,
              terrain: plot.facts.terrain,
              water: plot.facts.water,
              lake: plot.facts.lake,
              riverType: plot.facts.riverType,
              areaId: plot.facts.areaId,
              regionId: plot.facts.regionId,
              landmassId: plot.facts.landmassId,
            },
      sourceAuthorityStatus: "unresolved",
    };
  });
}

function plotsByLocationKey(plots: ReadonlyArray<Civ7PlotSnapshot>): Map<string, Civ7PlotSnapshot> {
  return new Map(
    plots.map((plot) => [locationKey(plot.location.x, plot.location.y), plot] as const)
  );
}

function locationKey(x: number, y: number): string {
  return `${x},${y}`;
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

if (import.meta.main) {
  main()
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error: unknown) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    });
}
