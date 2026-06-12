#!/usr/bin/env bun

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import {
  getCiv7FullMapGrid,
  getCiv7NativeRiverObjects,
  type Civ7NativeRiverObjectsResult,
  type Civ7RuntimeProbe,
} from "../../packages/civ7-direct-control/src/index.ts";
import {
  buildFinalSurfaceParityProof,
  configFromExactAuthorshipProof,
  dimensionsFromExactAuthorshipProof,
  hashParityValue,
  liveGridToFinalSurfaceSnapshot,
  runLocalFinalSurfaceSnapshot,
  validateExactAuthorshipProofPacket,
  type ExactAuthorshipProofLike,
  type NativeRiverObjectSnapshot,
} from "../../mods/mod-swooper-maps/src/dev/diagnostics/live-parity.ts";

type Args = Readonly<{
  requestId?: string;
  proofFile?: string;
  studioUrl: string;
  host?: string;
  port?: number;
  timeoutMs: number;
  maxPlotsPerRead: number;
  output?: string;
  help: boolean;
}>;

const usage = `Usage:
  bun scripts/civ7-direct-control/verify-final-surface-parity.ts --request-id <id>
  bun scripts/civ7-direct-control/verify-final-surface-parity.ts --proof-file <status-or-proof.json>

Options:
  --studio-url <url>          Studio URL for request status lookup (default: http://127.0.0.1:5174)
  --host <host>               Civ7 tuner host
  --port <port>               Civ7 tuner port
  --timeout-ms <ms>           Direct-control timeout (default: 45000)
  --max-plots-per-read <n>    Direct-control tile size cap (default: 512)
  --output <path>             Write full proof JSON to path
`;

function parseArgs(argv: string[]): Args {
  const args: {
    requestId?: string;
    proofFile?: string;
    studioUrl: string;
    host?: string;
    port?: number;
    timeoutMs: number;
    maxPlotsPerRead: number;
    output?: string;
    help: boolean;
  } = {
    studioUrl: "http://127.0.0.1:5174",
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
      case "--request-id":
        args.requestId = value();
        break;
      case "--proof-file":
        args.proofFile = value();
        break;
      case "--studio-url":
        args.studioUrl = value().replace(/\/+$/, "");
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
  return args;
}

function parseInteger(value: string, label: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) throw new Error(`${label} must be an integer: ${value}`);
  return parsed;
}

async function loadExactAuthorshipProof(args: Args): Promise<ExactAuthorshipProofLike> {
  if (args.proofFile) {
    return extractExactAuthorshipProof(JSON.parse(readFileSync(args.proofFile, "utf8")));
  }
  if (!args.requestId) throw new Error("Expected --request-id or --proof-file");
  // Studio oRPC transport (the legacy `/api/civ7/run-in-game/status` REST
  // endpoint is retired): POST the RPC envelope to `runInGame.status` and
  // unwrap the `json` payload — the same operation-state object the legacy
  // endpoint returned.
  const url = `${args.studioUrl}/rpc/runInGame/status`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ json: { requestId: args.requestId } }),
  });
  const envelope = (await response.json()) as { json?: unknown };
  const payload = envelope?.json;
  if (!response.ok || (isRecord(payload) && payload.ok === false)) {
    throw new Error(`Studio Run in Game status unavailable for ${args.requestId}: ${JSON.stringify(payload ?? envelope)}`);
  }
  return extractExactAuthorshipProof(payload);
}

export function extractExactAuthorshipProof(payload: unknown): ExactAuthorshipProofLike {
  if (!isRecord(payload)) throw new Error("Proof payload must be an object");
  const direct = isRecord(payload.exactAuthorshipProof) ? payload.exactAuthorshipProof : undefined;
  const status = isRecord(payload.status) ? payload.status : undefined;
  const nested = status && isRecord(status.exactAuthorshipProof) ? status.exactAuthorshipProof : undefined;
  const result = isRecord(payload.result) ? payload.result : undefined;
  const resultProof = result && isRecord(result.exactAuthorshipProof) ? result.exactAuthorshipProof : undefined;
  const parityProof = isRecord(payload.proof) ? payload.proof : undefined;
  const parityProofPacket = parityProof && isRecord(parityProof.exactAuthorshipPacket)
    ? parityProof.exactAuthorshipPacket
    : undefined;
  const proof = direct ?? nested ?? resultProof ?? parityProofPacket;
  if (!proof) throw new Error("Missing exactAuthorshipProof in status/proof payload");
  return proof as ExactAuthorshipProofLike;
}

function requireNumber(value: number | undefined, link: string, blockers: string[]): number {
  if (value === undefined) {
    blockers.push(link);
    return 0;
  }
  return value;
}

function probeNumber(value: Civ7RuntimeProbe<number> | undefined): number | undefined {
  if (!value || value.ok !== true || typeof value.value !== "number" || !Number.isFinite(value.value)) return undefined;
  return value.value;
}

function probeNullableNumber(value: Civ7RuntimeProbe<number | null> | undefined): number | null {
  if (!value || value.ok !== true || typeof value.value !== "number" || !Number.isFinite(value.value)) return null;
  return value.value;
}

function probeNullableBoolean(value: Civ7RuntimeProbe<boolean | null> | undefined): boolean | null {
  if (!value || value.ok !== true || typeof value.value !== "boolean") return null;
  return value.value;
}

function probeNativeRiverPlots(
  value: Civ7NativeRiverObjectsResult["samples"][number]["plots"] | undefined,
): NonNullable<NativeRiverObjectSnapshot["samples"]>[number]["plots"] {
  if (!value || value.ok !== true || !Array.isArray(value.value)) return undefined;
  return value.value.map((plot) => ({
    raw: plot.raw,
    index: typeof plot.index === "number" && Number.isFinite(plot.index) ? plot.index : null,
    location: plot.location && typeof plot.location.x === "number" && typeof plot.location.y === "number"
      ? { x: plot.location.x, y: plot.location.y }
      : null,
  }));
}

function nativeRiverObjectsSnapshot(result: Civ7NativeRiverObjectsResult): NativeRiverObjectSnapshot {
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
  exact: ExactAuthorshipProofLike;
  blockedBy: ReadonlyArray<string>;
  dimensions: ReturnType<typeof dimensionsFromExactAuthorshipProof>;
}) {
  const exactAuthorshipUnresolvedLinks = Array.isArray(args.exact.unresolvedLinks)
    ? [...new Set(args.exact.unresolvedLinks.filter((link): link is string => typeof link === "string"))].sort((a, b) => a.localeCompare(b))
    : [];
  return {
    ok: false,
    parityStatus: "blocked" as const,
    blockedBy: [...new Set(args.blockedBy)].sort((a, b) => a.localeCompare(b)),
    ...(exactAuthorshipUnresolvedLinks.length === 0 ? {} : { exactAuthorshipUnresolvedLinks }),
    exactAuthorshipSummary: {
      requestId: args.exact.requestId,
      status: args.exact.status,
      configHash: args.exact.sourceSnapshot?.configHash,
      envelopeHash: args.exact.sourceSnapshot?.envelopeHash,
      dimensions: args.dimensions,
    },
  };
}

async function main(): Promise<number> {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage);
    return 0;
  }

  const exact = await loadExactAuthorshipProof(args);
  const exactValidation = validateExactAuthorshipProofPacket(exact);
  const dimensions = dimensionsFromExactAuthorshipProof(exact);
  const localBlockers = [...exactValidation.unresolvedLinks];
  const width = requireNumber(dimensions.width, "exact-authorship-proof.runtime.width", localBlockers);
  const height = requireNumber(dimensions.height, "exact-authorship-proof.runtime.height", localBlockers);
  const seed = requireNumber(dimensions.seed, "exact-authorship-proof.request.seed", localBlockers);
  const config = configFromExactAuthorshipProof(exact);
  if (config === undefined) localBlockers.push("exact-authorship-proof.source-snapshot.pipeline-config");

  if (localBlockers.length > 0) {
    const output = buildBlockedFinalSurfaceParityOutput({ exact, blockedBy: localBlockers, dimensions });
    writeOutput(args.output, output);
    console.log(JSON.stringify(output, null, 2));
    return 2;
  }

  const local = runLocalFinalSurfaceSnapshot({
    width,
    height,
    seed,
    config,
    configHash: exact.sourceSnapshot?.configHash,
    envelopeHash: exact.sourceSnapshot?.envelopeHash,
  });

  const grid = await getCiv7FullMapGrid({
    fields: ["terrain", "biome", "feature", "resource", "hydrology"],
    includeHidden: true,
    maxPlotsPerRead: args.maxPlotsPerRead,
  }, {
    host: args.host,
    port: args.port,
    timeoutMs: args.timeoutMs,
  });
  const nativeRiverObjects = await getCiv7NativeRiverObjects(
    { maxSamples: 16 },
    {
      host: args.host,
      port: args.port,
      timeoutMs: args.timeoutMs,
    }
  );

  const liveSeed = probeNumber(grid.summary.map.randomSeed);
  const liveTurn = probeNumber(grid.summary.game.turn);
  const liveGameHash = probeNumber(grid.summary.game.hash);
  const live = liveGridToFinalSurfaceSnapshot({
    grid,
    width: grid.map.width,
    height: grid.map.height,
    ...(liveSeed === undefined ? {} : { seed: liveSeed }),
    configHash: exact.sourceSnapshot?.configHash,
    envelopeHash: exact.sourceSnapshot?.envelopeHash,
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
        sourceSnapshotId: exact.runtime?.sourceSnapshotId,
        snapshotHash: exact.runtime?.snapshotHash,
        turn: exact.runtime?.turn,
        gameHash: exact.runtime?.gameHash,
      },
    },
  });

  const proof = buildFinalSurfaceParityProof({ exactAuthorship: exact, local, live });
  const output = {
    ok: proof.status === "complete",
    parityStatus: proof.status,
    proofHash: hashParityValue(proof),
    proof,
  };
  writeOutput(args.output, output);
  console.log(JSON.stringify(output, null, 2));
  return proof.status === "complete" ? 0 : 2;
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

if (import.meta.main) {
  main()
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error) => {
      console.error(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }, null, 2));
      process.exitCode = 1;
    });
}
