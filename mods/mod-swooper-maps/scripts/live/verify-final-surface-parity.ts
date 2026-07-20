#!/usr/bin/env bun

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import {
  type Civ7NativeRiverObjectsResult,
  type Civ7RuntimeProbe,
  getCiv7FullMapGrid,
  getCiv7NativeRiverObjects,
} from "@civ7/direct-control";
import type {
  RunDiagnosticsLookupResult,
  RunInGameOperationStatus,
  StudioEffectContract,
} from "@civ7/studio-contract";
import {
  readStudioRunGenerationManifest,
  runCorrelationForManifest,
  type StudioRunGenerationManifest,
  type StudioRunGenerationManifestReference,
} from "@civ7/studio-run-workspace";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { ContractRouterClient } from "@orpc/contract";
import {
  buildFinalSurfaceParityReport,
  type CompleteExactAuthorshipEvidence,
  canonicalConfigFromGenerationManifest,
  dimensionsFromExactAuthorshipEvidence,
  hashParityValue,
  liveGridToFinalSurfaceSnapshot,
  type MapEnvelopeBounds,
  type NativeRiverObjectSnapshot,
  parseCompleteExactAuthorshipEvidencePacket,
  runLocalFinalSurfaceSnapshot,
} from "./live-parity.js";

type Args = Readonly<{
  requestId?: string;
  diagnosticsId?: string;
  evidenceFile?: string;
  studioUrl: string;
  host?: string;
  port?: number;
  timeoutMs: number;
  maxPlotsPerRead: number;
  output?: string;
  help: boolean;
}>;

const usage = `Usage:
  nx run mod-swooper-maps:verify:operational -- --mode final-surface-parity --request-id <id>
  nx run mod-swooper-maps:verify:operational -- --mode final-surface-parity --diagnostics-id <id>
  nx run mod-swooper-maps:verify:operational -- --mode final-surface-parity --evidence-file <diagnostics.json>

Options:
  --request-id <id>           Fresh-run lookup: public completion status, then its private diagnostics record
  --diagnostics-id <id>       Direct private diagnostics lookup after public status has expired
  --evidence-file <path>         Read a private diagnostics record and its referenced manifest
  --studio-url <url>          Studio oRPC URL for online lookups (default: http://127.0.0.1:5174)
  --host <host>               Civ7 tuner host
  --port <port>               Civ7 tuner port
  --timeout-ms <ms>           Direct-control timeout (default: 45000)
  --max-plots-per-read <n>    Direct-control tile size cap (default: 512)
  --output <path>             Write full evidence JSON to path
`;

export function parseFinalSurfaceParityArgs(argv: string[]): Args {
  const args: {
    requestId?: string;
    diagnosticsId?: string;
    evidenceFile?: string;
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
  let selectorCount = 0;

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
        selectorCount += 1;
        args.requestId = value();
        break;
      case "--diagnostics-id":
        selectorCount += 1;
        args.diagnosticsId = value();
        break;
      case "--evidence-file":
        selectorCount += 1;
        args.evidenceFile = value();
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
  if (!args.help && selectorCount !== 1) {
    throw new Error(
      "Exactly one of --request-id, --diagnostics-id, or --evidence-file is required"
    );
  }
  return args;
}

function parseInteger(value: string, label: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) throw new Error(`${label} must be an integer: ${value}`);
  return parsed;
}

type StudioRunInGameClient = Readonly<{
  runInGame: Readonly<{
    status: (input: Readonly<{ requestId: string }>) => Promise<RunInGameOperationStatus>;
    diagnostics: (
      input: Readonly<{ diagnosticsId: string }>
    ) => Promise<RunDiagnosticsLookupResult>;
  }>;
}>;

type StudioRunInGameClientFactory = (studioUrl: string) => StudioRunInGameClient;

export type FinalSurfaceParityEvidence = Readonly<{
  exact: CompleteExactAuthorshipEvidence;
  manifest: StudioRunGenerationManifest;
}>;

function createStudioRunInGameClient(studioUrl: string): StudioRunInGameClient {
  return createORPCClient<ContractRouterClient<StudioEffectContract>>(
    new RPCLink({ url: () => `${studioUrl}/rpc` })
  );
}

export async function loadFinalSurfaceParityEvidence(
  args: Args,
  clientFactory: StudioRunInGameClientFactory = createStudioRunInGameClient
): Promise<FinalSurfaceParityEvidence> {
  if (args.evidenceFile) {
    return extractFinalSurfaceParityEvidenceFromDiagnostics(
      JSON.parse(readFileSync(args.evidenceFile, "utf8"))
    );
  }
  const client = clientFactory(args.studioUrl);
  if (args.diagnosticsId) {
    const diagnostics = await client.runInGame.diagnostics({ diagnosticsId: args.diagnosticsId });
    return loadFinalSurfaceParityEvidenceFromDiagnosticsLookup({
      diagnosticsId: args.diagnosticsId,
      diagnostics,
    });
  }
  if (!args.requestId) {
    throw new Error("Expected --request-id, --diagnostics-id, or --evidence-file");
  }
  const status = await client.runInGame.status({ requestId: args.requestId });
  const diagnosticsId = requireDiagnosticsId(args.requestId, status);
  const diagnostics = await client.runInGame.diagnostics({ diagnosticsId });
  return loadFinalSurfaceParityEvidenceFromDiagnosticsLookup({
    diagnosticsId,
    expectedRequestId: args.requestId,
    diagnostics,
  });
}

/**
 * Public status only bridges a fresh request to private diagnostics. Direct
 * diagnostics lookup exists so verification can retrieve bounded private evidence
 * after the short-lived public operation projection expires.
 */
export async function loadFinalSurfaceParityEvidenceFromDiagnosticsLookup(
  args: Readonly<{
    diagnosticsId: string;
    expectedRequestId?: string;
    diagnostics: RunDiagnosticsLookupResult;
  }>
): Promise<FinalSurfaceParityEvidence> {
  if (!args.diagnostics.ok) {
    throw new Error(
      `Studio Run in Game diagnostics ${args.diagnosticsId} ${args.diagnostics.reason}`
    );
  }
  const diagnostics = args.diagnostics.diagnostics;
  if (diagnostics.diagnosticsId !== args.diagnosticsId) {
    throw new Error(
      `Studio Run in Game diagnostics id mismatch: expected ${args.diagnosticsId}, received ${diagnostics.diagnosticsId}`
    );
  }
  const requestId = diagnostics.requestId;
  if (args.expectedRequestId !== undefined && requestId !== args.expectedRequestId) {
    throw new Error(
      `Studio Run in Game diagnostics request mismatch: expected ${args.expectedRequestId}, received ${requestId}`
    );
  }
  const operation = diagnostics.sections.operation;
  if (!isRecord(operation)) {
    throw new Error(`Studio Run in Game diagnostics missing private operation for ${requestId}`);
  }
  if (operation.requestId !== requestId) {
    throw new Error(
      `Studio Run in Game private operation request mismatch: expected ${requestId}, received ${String(operation.requestId)}`
    );
  }
  if (operation.status !== "complete") {
    throw new Error(
      `Studio Run in Game private operation must be complete for ${requestId}: ${String(operation.status)}`
    );
  }
  const evidence = operation.exactAuthorshipEvidence;
  const exact = requireCompleteExactAuthorshipEvidence(evidence, requestId);
  const operationRevision = optionalOperationRevision(operation, requestId);
  if (
    diagnostics.operationRevision !== undefined &&
    operationRevision !== undefined &&
    diagnostics.operationRevision !== operationRevision
  ) {
    throw new Error(
      `Studio Run in Game operation revision mismatch for ${requestId}: persisted ${diagnostics.operationRevision}, private ${operationRevision}`
    );
  }
  return await evidenceFromPrivateOperation({
    requestId,
    operation,
    exact,
  });
}

function optionalOperationRevision(operation: Record<string, unknown>, requestId: string) {
  const operationRevision = operation.operationRevision;
  if (operationRevision === undefined) return undefined;
  if (typeof operationRevision === "number" && Number.isFinite(operationRevision)) {
    return operationRevision;
  }
  throw new Error(
    `Studio Run in Game private operation revision is invalid for ${requestId}: ${String(operationRevision)}`
  );
}

function requireDiagnosticsId(
  requestId: string,
  status: Pick<RunInGameOperationStatus, "requestId" | "diagnosticsId" | "status">
): string {
  if (status.requestId !== requestId) {
    throw new Error(
      `Studio Run in Game status request mismatch: expected ${requestId}, received ${status.requestId}`
    );
  }
  if (status.status !== "completed") {
    throw new Error(
      `Studio Run in Game status must be completed for final-surface parity: ${requestId} is ${status.status}`
    );
  }
  if (typeof status.diagnosticsId !== "string" || status.diagnosticsId.length === 0) {
    throw new Error(`Studio Run in Game status missing diagnostics id for ${requestId}`);
  }
  return status.diagnosticsId;
}

export async function extractFinalSurfaceParityEvidenceFromDiagnostics(
  payload: unknown
): Promise<FinalSurfaceParityEvidence> {
  if (!isRecord(payload)) throw new Error("Diagnostics payload must be an object");
  const requestId = stringValue(payload.requestId);
  const sections = recordValue(payload, "sections");
  const operation = recordValue(sections, "operation");
  const evidence = operation?.exactAuthorshipEvidence;
  if (!requestId || !operation || !evidence) {
    throw new Error("Diagnostics payload is missing its private operation evidence");
  }
  if (operation.requestId !== requestId) {
    throw new Error(
      `Studio Run in Game private operation request mismatch: expected ${requestId}, received ${String(operation.requestId)}`
    );
  }
  return await evidenceFromPrivateOperation({
    requestId,
    operation,
    exact: requireCompleteExactAuthorshipEvidence(evidence, requestId),
  });
}

function requireCompleteExactAuthorshipEvidence(
  value: unknown,
  requestId: string
): CompleteExactAuthorshipEvidence {
  const parsed = parseCompleteExactAuthorshipEvidencePacket(value);
  if (parsed.evidence === undefined) {
    throw new Error(
      `Studio Run in Game exact authorship evidence must be canonical and complete for ${requestId}: ${parsed.unresolvedLinks.join(", ")}`
    );
  }
  if (parsed.evidence.requestId !== requestId) {
    throw new Error(
      `Studio Run in Game evidence request mismatch: expected ${requestId}, received ${parsed.evidence.requestId}`
    );
  }
  return parsed.evidence;
}

async function evidenceFromPrivateOperation(
  args: Readonly<{
    requestId: string;
    operation: Record<string, unknown>;
    exact: CompleteExactAuthorshipEvidence;
  }>
): Promise<FinalSurfaceParityEvidence> {
  if (args.operation.status !== "complete") {
    throw new Error(
      `Studio Run in Game private operation must be complete for ${args.requestId}: ${String(args.operation.status)}`
    );
  }
  if (args.exact.requestId !== args.requestId) {
    throw new Error(
      `Studio Run in Game exact authorship evidence is not complete for ${args.requestId}`
    );
  }
  const manifestReference = generationManifestReferenceFromOperation(
    args.operation,
    args.requestId
  );
  const manifest = await readStudioRunGenerationManifest(manifestReference.path).catch(
    (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Studio Run in Game generation manifest is unavailable for ${args.requestId}: ${message}`
      );
    }
  );
  if (manifest.generationManifestDigest !== manifestReference.generationManifestDigest) {
    throw new Error(`Studio Run in Game generation manifest digest mismatch for ${args.requestId}`);
  }
  if (manifest.payload.requestId !== args.requestId) {
    throw new Error(
      `Studio Run in Game generation manifest request mismatch for ${args.requestId}`
    );
  }
  if (manifest.payload.runArtifactId !== manifestReference.runArtifactId) {
    throw new Error(
      `Studio Run in Game generation manifest artifact mismatch for ${args.requestId}`
    );
  }
  if (
    hashParityValue(manifestReference.correlation) !==
    hashParityValue(runCorrelationForManifest(manifest))
  ) {
    throw new Error(
      `Studio Run in Game generation manifest correlation mismatch for ${args.requestId}`
    );
  }
  return { exact: args.exact, manifest };
}

function generationManifestReferenceFromOperation(
  operation: Record<string, unknown>,
  requestId: string
): StudioRunGenerationManifestReference {
  const value = recordValue(operation, "generationManifest");
  const path = stringValue(value?.path);
  const generationManifestDigest = stringValue(value?.generationManifestDigest);
  const runArtifactId = stringValue(value?.runArtifactId);
  const correlation = value?.correlation;
  if (!path || !generationManifestDigest || !runArtifactId || !isRecord(correlation)) {
    throw new Error(
      `Studio Run in Game diagnostics missing generation manifest reference for ${requestId}`
    );
  }
  return {
    path,
    generationManifestDigest,
    runArtifactId: runArtifactId as `run-${string}`,
    correlation: correlation as StudioRunGenerationManifestReference["correlation"],
  };
}

function requireNumber(value: number | undefined, link: string, blockers: string[]): number {
  if (value === undefined) {
    blockers.push(link);
    return 0;
  }
  return value;
}

const MAP_ENVELOPE_BOUNDS_EVIDENCE_LINK =
  "generation-manifest.launch-envelope.source.canonical-config.latitude-bounds";

type ExactMapEnvelopeBoundsEvidence =
  | Readonly<{ status: "complete"; bounds: MapEnvelopeBounds }>
  | Readonly<{ status: "unresolved"; evidenceLink: typeof MAP_ENVELOPE_BOUNDS_EVIDENCE_LINK }>;

/** A same-request replay consumes the canonical envelope frozen in the manifest. */
export function resolveGenerationManifestMapEnvelopeBounds(
  canonicalConfig: unknown
): ExactMapEnvelopeBoundsEvidence {
  if (!isRecord(canonicalConfig)) {
    return { status: "unresolved", evidenceLink: MAP_ENVELOPE_BOUNDS_EVIDENCE_LINK };
  }
  const rawBounds = canonicalConfig.latitudeBounds;
  if (
    !isRecord(rawBounds) ||
    Object.keys(rawBounds).length !== 2 ||
    !Object.hasOwn(rawBounds, "topLatitude") ||
    !Object.hasOwn(rawBounds, "bottomLatitude") ||
    typeof rawBounds.topLatitude !== "number" ||
    !Number.isFinite(rawBounds.topLatitude) ||
    typeof rawBounds.bottomLatitude !== "number" ||
    !Number.isFinite(rawBounds.bottomLatitude) ||
    rawBounds.topLatitude <= rawBounds.bottomLatitude
  ) {
    return { status: "unresolved", evidenceLink: MAP_ENVELOPE_BOUNDS_EVIDENCE_LINK };
  }
  return {
    status: "complete",
    bounds: {
      topLatitude: rawBounds.topLatitude,
      bottomLatitude: rawBounds.bottomLatitude,
    },
  };
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
  const { exact, manifest } = evidence;
  const exactValidation = parseCompleteExactAuthorshipEvidencePacket(exact);
  const dimensions = dimensionsFromExactAuthorshipEvidence(exact);
  const blockers = [...exactValidation.unresolvedLinks];
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
  const config = canonicalConfigFromGenerationManifest(manifest);
  if (config === undefined) {
    blockers.push("generation-manifest.launch-envelope.canonical-config-admission");
  }
  const boundsEvidence = resolveGenerationManifestMapEnvelopeBounds(config);
  if (boundsEvidence.status === "unresolved") {
    blockers.push(boundsEvidence.evidenceLink);
  }
  addManifestCorrelationBlockers({ exact, manifest, blockers });

  if (blockers.length > 0) {
    return { status: "blocked", dimensions, blockedBy: blockers };
  }

  if (boundsEvidence.status !== "complete") {
    throw new Error("Final-surface parity bounds evidence must resolve before local replay.");
  }
  if (config === undefined) {
    throw new Error("Final-surface parity manifest config must resolve before local replay.");
  }

  return {
    status: "ready",
    dimensions,
    input: {
      width,
      height,
      seed,
      config,
      canonicalConfigDigest: manifest.payload.canonicalConfigDigest,
      launchEnvelopeDigest: manifest.payload.launchEnvelopeDigest,
      mapEnvelopeBounds: boundsEvidence.bounds,
    },
  };
}

function addManifestCorrelationBlockers(
  args: Readonly<{
    exact: CompleteExactAuthorshipEvidence;
    manifest: StudioRunGenerationManifest;
    blockers: string[];
  }>
): void {
  const { exact, manifest, blockers } = args;
  const payload = manifest.payload;
  addStringMismatch(blockers, exact.requestId, payload.requestId, "generation-manifest.request-id");
  addStringMismatch(
    blockers,
    exact.canonicalConfigDigest,
    payload.canonicalConfigDigest,
    "generation-manifest.canonical-config-digest"
  );
  addStringMismatch(
    blockers,
    exact.launchEnvelopeDigest,
    payload.launchEnvelopeDigest,
    "generation-manifest.launch-envelope-digest"
  );
  addStringMismatch(
    blockers,
    exact.materialization?.canonicalConfigDigest,
    payload.canonicalConfigDigest,
    "generation-manifest.materialization.canonical-config-digest"
  );
  addStringMismatch(
    blockers,
    exact.materialization?.launchEnvelopeDigest,
    payload.launchEnvelopeDigest,
    "generation-manifest.materialization.launch-envelope-digest"
  );
  addStringMismatch(
    blockers,
    exact.materialization?.generationManifestDigest,
    manifest.generationManifestDigest,
    "generation-manifest.materialization.generation-manifest-digest"
  );
  addStringMismatch(
    blockers,
    exact.materialization?.runArtifactId,
    payload.runArtifactId,
    "generation-manifest.materialization.run-artifact-id"
  );
  addStringMismatch(
    blockers,
    exact.log?.canonicalConfigDigest,
    payload.canonicalConfigDigest,
    "generation-manifest.log.canonical-config-digest"
  );
  addStringMismatch(
    blockers,
    exact.log?.launchEnvelopeDigest,
    payload.launchEnvelopeDigest,
    "generation-manifest.log.launch-envelope-digest"
  );
}

function addStringMismatch(
  blockers: string[],
  actual: string | undefined,
  expected: string,
  link: string
): void {
  if (actual !== undefined && actual !== expected) blockers.push(link);
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
  manifest: StudioRunGenerationManifest;
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
      canonicalConfigDigest: args.manifest.payload.canonicalConfigDigest,
      launchEnvelopeDigest: args.manifest.payload.launchEnvelopeDigest,
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

  const evidence = await loadFinalSurfaceParityEvidence(args);
  const replay = resolveFinalSurfaceParityReplay(evidence);
  if (replay.status === "blocked") {
    const output = buildBlockedFinalSurfaceParityOutput({
      exact: evidence.exact,
      manifest: evidence.manifest,
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
    {
      host: args.host,
      port: args.port,
      timeoutMs: args.timeoutMs,
    }
  );
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
    canonicalConfigDigest: evidence.manifest.payload.canonicalConfigDigest,
    launchEnvelopeDigest: evidence.manifest.payload.launchEnvelopeDigest,
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

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
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
