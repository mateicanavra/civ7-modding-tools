#!/usr/bin/env bun

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import {
  type Civ7NativeRiverObjectsResult,
  type Civ7RuntimeProbe,
  getCiv7FullMapGrid,
  getCiv7NativeRiverObjects,
} from "@civ7/direct-control";
import {
  buildFinalSurfaceParityReport,
  type CompleteExactAuthorshipEvidence,
  configFromExactAuthorshipEvidence,
  dimensionsFromExactAuthorshipEvidence,
  hashParityValue,
  liveGridToFinalSurfaceSnapshot,
  type NativeRiverObjectSnapshot,
  parseCompleteExactAuthorshipEvidencePacket,
  runLocalFinalSurfaceSnapshot,
} from "../../src/dev/diagnostics/live-parity.js";
import { admitSwooperCatalogConfig } from "../../src/maps/catalog/admission.js";

type Args = Readonly<{
  evidenceFile?: string;
  host?: string;
  port?: number;
  timeoutMs: number;
  maxPlotsPerRead: number;
  output?: string;
  help: boolean;
}>;

const usage = `Usage:
  nx run mod-swooper-maps:verify -- --mode final-surface-parity --evidence-file <diagnostics.json>

Options:
  --evidence-file <path>      Read exact authorship evidence for the completed run
  --host <host>               Civ7 tuner host
  --port <port>               Civ7 tuner port
  --timeout-ms <ms>           Direct-control timeout (default: 45000)
  --max-plots-per-read <n>    Direct-control tile size cap (default: 512)
  --output <path>             Write the full verification report to path
`;

export function parseFinalSurfaceParityArgs(argv: string[]): Args {
  const args: {
    evidenceFile?: string;
    host?: string;
    port?: number;
    timeoutMs: number;
    maxPlotsPerRead: number;
    output?: string;
    help: boolean;
  } = {
    timeoutMs: 45_000,
    maxPlotsPerRead: 512,
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
      case "--evidence-file":
        args.evidenceFile = value();
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
      case "--max-plots-per-read":
        args.maxPlotsPerRead = parseInteger(value(), arg);
        break;
      case "--output":
        args.output = value();
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }
  if (!args.help && args.evidenceFile === undefined) {
    throw new Error("--evidence-file is required");
  }
  return args;
}

function parseInteger(value: string, label: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) throw new Error(`${label} must be an integer: ${value}`);
  return parsed;
}

export type FinalSurfaceParityEvidence = Readonly<{
  exact: CompleteExactAuthorshipEvidence;
  canonicalConfig?: unknown;
}>;

export function loadFinalSurfaceParityEvidence(path: string): FinalSurfaceParityEvidence {
  const evidence = extractFinalSurfaceParityEvidence(JSON.parse(readFileSync(path, "utf8")));
  if (evidence.canonicalConfig !== undefined) return evidence;
  const source = evidence.exact.sourceSnapshot.source;
  if (source.kind !== "catalog") return evidence;
  const canonicalConfig = JSON.parse(readFileSync(resolve(source.sourcePath), "utf8"));
  return {
    exact: evidence.exact,
    canonicalConfig: admitSwooperCatalogConfig({
      sourcePath: source.sourcePath,
      canonicalConfig,
    }).canonicalConfig,
  };
}

export function extractFinalSurfaceParityEvidence(payload: unknown): FinalSurfaceParityEvidence {
  if (!isRecord(payload)) throw new Error("Evidence payload must be an object");
  const status = recordValue(payload, "status");
  const result = recordValue(payload, "result");
  const report = recordValue(payload, "report");
  const sections = recordValue(payload, "sections");
  const operation = recordValue(sections, "operation");
  const rawEvidence =
    payload.exactAuthorshipEvidence ??
    status?.exactAuthorshipEvidence ??
    result?.exactAuthorshipEvidence ??
    report?.exactAuthorshipEvidence ??
    operation?.exactAuthorshipEvidence ??
    payload;
  const parsed = parseCompleteExactAuthorshipEvidencePacket(rawEvidence);
  if (parsed.evidence === undefined) {
    throw new Error(
      `Exact authorship evidence must be canonical and complete: ${parsed.unresolvedLinks.join(", ")}`
    );
  }
  return {
    exact: parsed.evidence,
    ...(payload.canonicalConfig === undefined ? {} : { canonicalConfig: payload.canonicalConfig }),
  };
}

function requireNumber(value: number | undefined, link: string, blockers: string[]): number {
  if (value === undefined) {
    blockers.push(link);
    return 0;
  }
  return value;
}

export type FinalSurfaceParityReplayResolution =
  | Readonly<{
      status: "ready";
      dimensions: ReturnType<typeof dimensionsFromExactAuthorshipEvidence>;
      input: Parameters<typeof runLocalFinalSurfaceSnapshot>[0];
    }>
  | Readonly<{
      status: "blocked";
      dimensions: ReturnType<typeof dimensionsFromExactAuthorshipEvidence>;
      blockedBy: ReadonlyArray<string>;
    }>;

export function resolveFinalSurfaceParityReplay(
  evidence: FinalSurfaceParityEvidence
): FinalSurfaceParityReplayResolution {
  const { exact } = evidence;
  const validation = parseCompleteExactAuthorshipEvidencePacket(exact);
  const dimensions = dimensionsFromExactAuthorshipEvidence(exact);
  const blockers = [...validation.unresolvedLinks];
  const width = requireNumber(
    dimensions.width,
    "exact-authorship-evidence.runtime.width",
    blockers
  );
  const height = requireNumber(
    dimensions.height,
    "exact-authorship-evidence.runtime.height",
    blockers
  );
  const seed = requireNumber(dimensions.seed, "exact-authorship-evidence.request.seed", blockers);
  const config = configFromExactAuthorshipEvidence(exact, evidence.canonicalConfig);
  if (config === undefined) {
    blockers.push("exact-authorship-evidence.source-snapshot.canonical-config");
  }
  if (blockers.length > 0) {
    return { status: "blocked", dimensions, blockedBy: blockers };
  }
  if (config === undefined) {
    throw new Error("Final-surface parity config must resolve before local replay.");
  }
  return {
    status: "ready",
    dimensions,
    input: {
      width,
      height,
      seed,
      config,
      canonicalConfigDigest: exact.sourceSnapshot.canonicalConfigDigest,
      launchEnvelopeDigest: exact.sourceSnapshot.launchEnvelopeDigest,
    },
  };
}

function probeNumber(value: Civ7RuntimeProbe<number> | undefined): number | undefined {
  if (
    !value ||
    value.ok !== true ||
    typeof value.value !== "number" ||
    !Number.isFinite(value.value)
  )
    return undefined;
  return value.value;
}

function probeNullableNumber(value: Civ7RuntimeProbe<number | null> | undefined): number | null {
  if (
    !value ||
    value.ok !== true ||
    typeof value.value !== "number" ||
    !Number.isFinite(value.value)
  )
    return null;
  return value.value;
}

function probeNullableBoolean(value: Civ7RuntimeProbe<boolean | null> | undefined): boolean | null {
  if (!value || value.ok !== true || typeof value.value !== "boolean") return null;
  return value.value;
}

function probeNativeRiverPlots(
  value: Civ7NativeRiverObjectsResult["samples"][number]["plots"] | undefined
): NonNullable<NativeRiverObjectSnapshot["samples"]>[number]["plots"] {
  if (!value || value.ok !== true || !Array.isArray(value.value)) return undefined;
  return value.value.map((plot) => ({
    raw: plot.raw,
    index: typeof plot.index === "number" && Number.isFinite(plot.index) ? plot.index : null,
    location:
      plot.location && typeof plot.location.x === "number" && typeof plot.location.y === "number"
        ? { x: plot.location.x, y: plot.location.y }
        : null,
  }));
}

function nativeRiverObjectsSnapshot(
  result: Civ7NativeRiverObjectsResult
): NativeRiverObjectSnapshot {
  return {
    exists: result.exists,
    numRivers: probeNumber(result.numRivers) ?? null,
    sampleCount: result.samples.length,
    samples: result.samples.map((sample) => {
      const plots = probeNativeRiverPlots(sample.plots);
      return {
        index: sample.index,
        riverType: probeNullableNumber(sample.riverType),
        plotCount: probeNullableNumber(sample.plotCount),
        plotSampleCount: sample.plotSampleCount,
        plotTruncated: sample.plotTruncated,
        ...(plots === undefined ? {} : { plots }),
        connectedToOcean: probeNullableBoolean(sample.connectedToOcean),
      };
    }),
    blockedBy: [
      ...(result.exists ? [] : ["native-river-objects.MapRivers.missing"]),
      ...(result.numRivers.ok ? [] : ["native-river-objects.numRivers.unavailable"]),
    ],
  };
}

export function buildBlockedFinalSurfaceParityOutput(args: {
  exact: CompleteExactAuthorshipEvidence;
  blockedBy: ReadonlyArray<string>;
  dimensions: ReturnType<typeof dimensionsFromExactAuthorshipEvidence>;
}) {
  return {
    ok: false,
    parityStatus: "blocked" as const,
    blockedBy: [...new Set(args.blockedBy)].sort((a, b) => a.localeCompare(b)),
    exactAuthorshipSummary: {
      requestId: args.exact.requestId,
      status: args.exact.status,
      canonicalConfigDigest: args.exact.sourceSnapshot.canonicalConfigDigest,
      launchEnvelopeDigest: args.exact.sourceSnapshot.launchEnvelopeDigest,
      dimensions: args.dimensions,
    },
  };
}

async function main(): Promise<number> {
  const args = parseFinalSurfaceParityArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage);
    return 0;
  }
  if (args.evidenceFile === undefined) throw new Error("--evidence-file is required");
  const evidence = loadFinalSurfaceParityEvidence(args.evidenceFile);
  const replay = resolveFinalSurfaceParityReplay(evidence);
  if (replay.status === "blocked") {
    const output = buildBlockedFinalSurfaceParityOutput({
      exact: evidence.exact,
      blockedBy: replay.blockedBy,
      dimensions: replay.dimensions,
    });
    writeOutput(args.output, output);
    console.log(JSON.stringify(output, null, 2));
    return 2;
  }

  const exact = evidence.exact;
  const local = runLocalFinalSurfaceSnapshot(replay.input);
  const grid = await getCiv7FullMapGrid(
    {
      fields: ["terrain", "biome", "feature", "resource", "hydrology"],
      includeHidden: true,
      maxPlotsPerRead: args.maxPlotsPerRead,
    },
    { host: args.host, port: args.port, timeoutMs: args.timeoutMs }
  );
  const nativeRiverObjects = await getCiv7NativeRiverObjects(
    { maxSamples: 16 },
    { host: args.host, port: args.port, timeoutMs: args.timeoutMs }
  );
  const liveSeed = probeNumber(grid.summary.map.randomSeed);
  const liveTurn = probeNumber(grid.summary.game.turn);
  const liveGameHash = probeNumber(grid.summary.game.hash);
  const live = liveGridToFinalSurfaceSnapshot({
    grid,
    width: grid.map.width,
    height: grid.map.height,
    ...(liveSeed === undefined ? {} : { seed: liveSeed }),
    canonicalConfigDigest: exact.sourceSnapshot.canonicalConfigDigest,
    launchEnvelopeDigest: exact.sourceSnapshot.launchEnvelopeDigest,
    nativeRiverObjects: nativeRiverObjectsSnapshot(nativeRiverObjects),
    evidence: {
      nativeRiverObjects,
      fullGrid: {
        bounds: grid.bounds,
        plotCount: grid.plotCount,
        omitted: grid.omitted,
        chunkCount: grid.chunks.length,
        chunks: grid.chunks,
        hiddenInfoPolicy: grid.hiddenInfoPolicy,
        identityCheck: grid.identityCheck,
        initialSummary: {
          seed: probeNumber(grid.summary.map.randomSeed),
          turn: probeNumber(grid.summary.game.turn),
          gameHash: probeNumber(grid.summary.game.hash),
          width: probeNumber(grid.summary.map.width),
          height: probeNumber(grid.summary.map.height),
          plotCount: probeNumber(grid.summary.map.plotCount),
        },
        postReadSummary: {
          seed: probeNumber(grid.postReadSummary.map.randomSeed),
          turn: probeNumber(grid.postReadSummary.game.turn),
          gameHash: probeNumber(grid.postReadSummary.game.hash),
          width: probeNumber(grid.postReadSummary.map.width),
          height: probeNumber(grid.postReadSummary.map.height),
          plotCount: probeNumber(grid.postReadSummary.map.plotCount),
        },
      },
      runtime: {
        ...(liveSeed === undefined ? {} : { seed: liveSeed }),
        ...(liveTurn === undefined ? {} : { turn: liveTurn }),
        ...(liveGameHash === undefined ? {} : { gameHash: liveGameHash }),
        plotCount: grid.plotCount,
        width: grid.map.width,
        height: grid.map.height,
      },
      exactRuntimeSnapshot: {
        sourceSnapshotId: exact.runtime.sourceSnapshotId,
        snapshotHash: exact.runtime.snapshotHash,
        turn: exact.runtime.turn,
        gameHash: exact.runtime.gameHash,
      },
    },
  });

  const report = buildFinalSurfaceParityReport({ exactAuthorship: exact, local, live });
  const output = {
    ok: report.status === "complete",
    parityStatus: report.status,
    reportHash: hashParityValue(report),
    report,
  };
  writeOutput(args.output, output);
  console.log(JSON.stringify(output, null, 2));
  return report.status === "complete" ? 0 : 2;
}

function writeOutput(path: string | undefined, output: unknown): void {
  if (!path) return;
  const absolute = resolve(path);
  mkdirSync(dirname(absolute), { recursive: true });
  writeFileSync(absolute, JSON.stringify(output, null, 2));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function recordValue(value: unknown, key: string): Record<string, unknown> | undefined {
  return isRecord(value) && isRecord(value[key]) ? value[key] : undefined;
}

if (import.meta.main) {
  main()
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error) => {
      console.error(
        JSON.stringify(
          { ok: false, error: error instanceof Error ? error.message : String(error) },
          null,
          2
        )
      );
      process.exitCode = 1;
    });
}
