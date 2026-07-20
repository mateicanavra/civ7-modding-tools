#!/usr/bin/env bun

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import {
  type Civ7MapGridResult,
  type Civ7PlotSnapshot,
  type Civ7PlotSnapshotField,
  getCiv7MapGrid,
  getCiv7MapSummary,
} from "@civ7/direct-control";
import { hashParityValue, stableParityReportStringify } from "./live-parity.js";
import {
  buildTerrainDeltaEdgeContexts,
  type TerrainDeltaEdgeContext,
} from "./surface-delta-context.js";
import {
  compareVerificationRuntimeIdentity,
  extractVerificationReport,
  resolveVerificationRequestIdentity,
} from "./verification-identity.js";

type Args = Readonly<{
  reportFile?: string;
  contextFile?: string;
  host?: string;
  port?: number;
  timeoutMs: number;
  maxCells: number;
  output?: string;
  help: boolean;
}>;

const usage = `Usage:
  nx run mod-swooper-maps:verify:operational -- --mode terrain-edge-live-context --report-file <final-surface-parity-report.json>

Options:
  --context-file <path> Optional terrain edge context artifact to join by plot index
  --host <host>       Civ7 tuner host
  --port <port>       Civ7 tuner port
  --timeout-ms <ms>   Direct-control timeout (default: 45000)
  --max-cells <n>     Safety cap for terrain delta cells (default: 16)
  --output <path>     Write full report JSON to path
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
    reportFile?: string;
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
      case "--report-file":
        args.reportFile = value();
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
  if (!args.reportFile) throw new Error("Expected --report-file");

  const report = extractVerificationReport(JSON.parse(readFileSync(args.reportFile, "utf8")));
  const contextArtifact = args.contextFile
    ? JSON.parse(readFileSync(args.contextFile, "utf8"))
    : undefined;
  const contextRowsByPlot = readContextRowsByPlot(contextArtifact);
  const requestIdentity = resolveVerificationRequestIdentity(report);
  if (requestIdentity.blockedBy.length > 0) {
    const outputWithoutHash = {
      ok: false,
      status: "blocked" as const,
      requestId: requestIdentity.requestId,
      sourceReportHash: hashParityValue(report),
      sourceContextHash: contextArtifact === undefined ? null : hashParityValue(contextArtifact),
      blockedBy: requestIdentity.blockedBy,
      requestIdentity,
    };
    const output = { ...outputWithoutHash, reportHash: hashParityValue(outputWithoutHash) };
    writeOutput(args.output, output);
    console.log(stableParityReportStringify(output));
    return 2;
  }

  const currentRuntime = await getCiv7MapSummary({
    host: args.host,
    port: args.port,
    timeoutMs: args.timeoutMs,
  });
  const runtimeIdentity = compareVerificationRuntimeIdentity(report, currentRuntime);
  if (runtimeIdentity.blockedBy.length > 0) {
    const outputWithoutHash = {
      ok: false,
      status: "blocked" as const,
      requestId: requestIdentity.requestId,
      sourceReportHash: hashParityValue(report),
      sourceContextHash: contextArtifact === undefined ? null : hashParityValue(contextArtifact),
      blockedBy: runtimeIdentity.blockedBy,
      requestIdentity,
      runtimeIdentity,
    };
    const output = { ...outputWithoutHash, reportHash: hashParityValue(outputWithoutHash) };
    writeOutput(args.output, output);
    console.log(stableParityReportStringify(output));
    return 2;
  }

  const terrainRows = buildTerrainDeltaEdgeContexts({ local: report.local, live: report.live });
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
      sourceReportHash: hashParityValue(report),
      sourceContextHash: contextArtifact === undefined ? null : hashParityValue(contextArtifact),
      blockedBy: completeness.blockedBy,
      requestIdentity,
      runtimeIdentity,
      livePlotContext: summarizeLivePlotContext(livePlotContext),
      completeness,
    };
    const output = { ...outputWithoutHash, reportHash: hashParityValue(outputWithoutHash) };
    writeOutput(args.output, output);
    console.log(stableParityReportStringify(output));
    return 2;
  }

  const outputWithoutHash = {
    ok: true,
    status: "complete" as const,
    requestId: requestIdentity.requestId,
    sourceReportHash: hashParityValue(report),
    sourceContextHash: contextArtifact === undefined ? null : hashParityValue(contextArtifact),
    evidenceBoundary:
      "Diagnostic context only: live terrain/hydrology/area readback is exact-runtime-bound evidence for terrain edge source-authority classification. It does not authorize terrain repair, parity closure, product acceptance, or tuning by itself.",
    requestIdentity,
    runtimeIdentity,
    rowCount: terrainRows.length,
    livePlotContext: summarizeLivePlotContext(livePlotContext),
    rows: summarizeRows(terrainRows, livePlotContext, contextRowsByPlot),
  };
  const output = { ...outputWithoutHash, reportHash: hashParityValue(outputWithoutHash) };
  writeOutput(args.output, output);
  console.log(stableParityReportStringify(output));
  return 0;
}

export function summarizeTerrainEdgeReadbackCompleteness(
  rows: ReadonlyArray<TerrainDeltaEdgeContext>,
  readback: Civ7MapGridResult
) {
  const plotsByLocation = plotsByLocationKey(readback.plots);
  const missingRows = rows.filter((row) => !plotsByLocation.has(locationKey(row.x, row.y)));
  const factIssues: Array<{
    x: number;
    y: number;
    plotIndex: number;
    field: (typeof REQUIRED_LIVE_TERRAIN_EDGE_FACTS)[number];
    status: "missing" | "failed";
    link: string;
    fact?: unknown;
  }> = [];
  for (const row of rows) {
    const plot = plotsByLocation.get(locationKey(row.x, row.y));
    if (plot === undefined) continue;
    for (const field of REQUIRED_LIVE_TERRAIN_EDGE_FACTS) {
      const fact = plot.facts[field];
      if (fact === undefined) {
        factIssues.push({
          x: row.x,
          y: row.y,
          plotIndex: row.plotIndex,
          field,
          status: "missing",
          link: `live-terrain-readback.${field}.missing`,
        });
        continue;
      }
      if (!isRecord(fact) || fact.ok !== true || !("value" in fact) || fact.value === undefined) {
        factIssues.push({
          x: row.x,
          y: row.y,
          plotIndex: row.plotIndex,
          field,
          status: "failed",
          link: `live-terrain-readback.${field}.failed`,
          fact,
        });
      }
    }
  }
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
  writeFileSync(absolute, `${stableParityReportStringify(output)}\n`);
}

function numberValue(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
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
