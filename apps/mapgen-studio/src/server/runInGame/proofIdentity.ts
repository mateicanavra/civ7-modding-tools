import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";

import type {
  RunInGameExactAuthorshipProof,
  RunInGameFileIdentity,
  RunInGameMaterializationStatus,
  RunInGameRequestStatus,
  RunInGameSourceSnapshotProof,
} from "../../features/runInGame/status";

export async function fileIdentity(args: {
  repoRoot: string;
  path: string;
  exposeAs?: "relative-to-repo" | "absolute";
}): Promise<RunInGameFileIdentity> {
  const absolutePath = isAbsolute(args.path) ? args.path : resolve(args.repoRoot, args.path);
  const [metadata, bytes] = await Promise.all([
    stat(absolutePath),
    readFile(absolutePath),
  ]);
  return {
    path: args.exposeAs === "absolute" ? absolutePath : relative(args.repoRoot, absolutePath),
    sha256: createHash("sha256").update(bytes).digest("hex"),
    sizeBytes: metadata.size,
    mtimeMs: metadata.mtimeMs,
    mtimeIso: metadata.mtime.toISOString(),
  };
}

export function parseDeployTargetDir(stdout: string): string | null {
  const match = stdout.match(/Deployed to:\s*(.+)$/m);
  return match?.[1]?.trim() || null;
}

export function buildRunInGameSourceSnapshotProof(args: {
  requestId: string;
  sourceSnapshot: unknown;
  configHash: string;
  envelopeHash: string;
}): RunInGameSourceSnapshotProof | undefined {
  if (!isRecord(args.sourceSnapshot)) return undefined;
  return {
    identityHash: hashProofValue({
      sourceSnapshot: args.sourceSnapshot,
      configHash: args.configHash,
      envelopeHash: args.envelopeHash,
    }),
    requestId: args.requestId,
    ...(args.sourceSnapshot.recipeSettings === undefined ? {} : { recipeSettings: args.sourceSnapshot.recipeSettings }),
    ...(args.sourceSnapshot.worldSettings === undefined ? {} : { worldSettings: args.sourceSnapshot.worldSettings }),
    ...(args.sourceSnapshot.pipelineConfig === undefined ? {} : { pipelineConfig: args.sourceSnapshot.pipelineConfig }),
    ...(args.sourceSnapshot.setupConfig === undefined ? {} : { setupConfig: args.sourceSnapshot.setupConfig }),
    ...(typeof args.sourceSnapshot.materializationMode === "string"
      ? { materializationMode: args.sourceSnapshot.materializationMode }
      : {}),
    ...(args.sourceSnapshot.selectedConfig === undefined ? {} : { selectedConfig: args.sourceSnapshot.selectedConfig }),
    configHash: args.configHash,
    envelopeHash: args.envelopeHash,
  };
}

export function buildRunInGameExactAuthorshipProof(args: {
  requestId: string;
  request?: RunInGameRequestStatus;
  sourceSnapshot?: RunInGameSourceSnapshotProof;
  materialization: RunInGameMaterializationStatus;
  sourceConfig?: RunInGameFileIdentity;
  generatedSourceScript?: RunInGameFileIdentity;
  localModScript?: RunInGameFileIdentity;
  deployedModScript?: RunInGameFileIdentity;
  rowProof?: unknown;
  setupSnapshot?: unknown;
  startMapSummary?: unknown;
  logProof?: RunInGameExactAuthorshipProof["log"];
  liveRuntimeSnapshot?: {
    snapshotId?: string;
    snapshotHash?: string;
    turn?: number;
    gameHash?: number;
  };
  createdAt?: string;
}): RunInGameExactAuthorshipProof {
  const setupReadback = setupReadbackFromSnapshot(args.setupSnapshot);
  const runtimeSummary = runtimeSummaryFromMapSummary(args.startMapSummary);
  const runtimeTurn = runtimeSummary.turn ?? args.liveRuntimeSnapshot?.turn;
  const runtimeGameHash = runtimeSummary.gameHash ?? args.liveRuntimeSnapshot?.gameHash;
  const sourceConfig = args.sourceConfig ?? args.materialization.sourceConfig;
  const generatedSourceScript = args.generatedSourceScript ?? args.materialization.generatedSourceScript;
  const localModScript = args.localModScript ?? args.materialization.localModScript;
  const deployedModScript = args.deployedModScript ?? args.materialization.deployedModScript;
  const unresolvedLinks: string[] = [];

  addMissing(unresolvedLinks, Boolean(args.sourceSnapshot?.identityHash), "source-snapshot.identity-hash");
  addMissing(unresolvedLinks, args.sourceSnapshot?.recipeSettings !== undefined, "source-snapshot.recipe-settings");
  addMissing(unresolvedLinks, args.sourceSnapshot?.worldSettings !== undefined, "source-snapshot.world-settings");
  addMissing(unresolvedLinks, args.sourceSnapshot?.pipelineConfig !== undefined, "source-snapshot.pipeline-config");
  addMissing(unresolvedLinks, args.sourceSnapshot?.setupConfig !== undefined, "source-snapshot.setup-config");
  addMissing(unresolvedLinks, Boolean(args.sourceSnapshot?.materializationMode), "source-snapshot.materialization-mode");
  addMissing(unresolvedLinks, args.sourceSnapshot?.selectedConfig !== undefined, "source-snapshot.selected-config");
  addMissing(unresolvedLinks, Boolean(args.sourceSnapshot?.configHash), "source-snapshot.config-hash");
  addMissing(unresolvedLinks, Boolean(args.sourceSnapshot?.envelopeHash), "source-snapshot.envelope-hash");
  addMissing(unresolvedLinks, Boolean(args.request?.fingerprint), "request.fingerprint");
  addMissing(unresolvedLinks, args.request?.seed !== undefined, "request.seed");
  addMissing(unresolvedLinks, Boolean(args.request?.mapSize), "request.map-size");
  addMissing(unresolvedLinks, Boolean(args.materialization.mapScript), "materialization.map-script");
  addMissing(unresolvedLinks, Boolean(args.materialization.configHash), "materialization.config-hash");
  addMissing(unresolvedLinks, Boolean(args.materialization.envelopeHash), "materialization.envelope-hash");
  addMissing(unresolvedLinks, Boolean(sourceConfig), "materialization.source-config-file");
  addMissing(unresolvedLinks, Boolean(generatedSourceScript), "materialization.generated-source-script");
  addMissing(unresolvedLinks, Boolean(localModScript), "materialization.local-mod-script");
  addMissing(unresolvedLinks, Boolean(deployedModScript), "materialization.deployed-mod-script");
  addMissing(unresolvedLinks, hasRows(args.rowProof), "civ-setup.map-row");
  addMissing(unresolvedLinks, setupReadback.mapScript !== undefined, "civ-setup.map-script-readback");
  addMissing(unresolvedLinks, setupReadback.mapSize !== undefined, "civ-setup.map-size-readback");
  addMissing(unresolvedLinks, setupReadback.mapSeed !== undefined, "civ-setup.map-seed-readback");
  addMissing(unresolvedLinks, setupReadback.gameSeed !== undefined, "civ-setup.game-seed-readback");
  if (args.request?.playerCount !== undefined) {
    addMissing(unresolvedLinks, setupReadback.playerCount !== undefined, "civ-setup.player-count-readback");
  }
  addMissing(unresolvedLinks, runtimeSummary.seed !== undefined, "runtime.seed-readback");
  addMissing(unresolvedLinks, runtimeSummary.width !== undefined && runtimeSummary.height !== undefined, "runtime.dimensions");
  addMissing(unresolvedLinks, runtimeGameHash !== undefined, "runtime.game-hash");
  addMissing(unresolvedLinks, Boolean(args.liveRuntimeSnapshot?.snapshotId), "runtime.live-snapshot-id");
  addMissing(unresolvedLinks, Boolean(args.logProof), "swooper-log.parsed-proof");

  addStringMismatch(unresolvedLinks, args.sourceSnapshot?.requestId, args.requestId, "source-snapshot.request-id-mismatch");
  addStringMismatch(unresolvedLinks, args.sourceSnapshot?.configHash, args.materialization.configHash, "source-snapshot.config-hash-mismatch");
  addStringMismatch(unresolvedLinks, args.sourceSnapshot?.envelopeHash, args.materialization.envelopeHash, "source-snapshot.envelope-hash-mismatch");
  addStringMismatch(unresolvedLinks, setupReadback.mapScript, args.materialization.mapScript, "civ-setup.map-script-mismatch");
  addStringMismatch(unresolvedLinks, setupReadback.mapSize, args.request?.mapSize, "civ-setup.map-size-mismatch");
  addNumberMismatch(unresolvedLinks, setupReadback.mapSeed, args.request?.seed, "civ-setup.map-seed-mismatch");
  addNumberMismatch(unresolvedLinks, setupReadback.gameSeed, args.request?.seed, "civ-setup.game-seed-mismatch");
  addNumberMismatch(unresolvedLinks, setupReadback.playerCount, args.request?.playerCount, "civ-setup.player-count-mismatch");
  addNumberMismatch(unresolvedLinks, runtimeSummary.seed, args.request?.seed, "runtime.seed-mismatch");
  addNumberMismatch(unresolvedLinks, args.logProof?.seed, args.request?.seed, "swooper-log.seed-mismatch");
  addStringMismatch(unresolvedLinks, args.logProof?.requestId, args.requestId, "swooper-log.request-id-mismatch");
  addStringMismatch(unresolvedLinks, args.logProof?.configHash, args.materialization.configHash, "swooper-log.config-hash-mismatch");
  addStringMismatch(unresolvedLinks, args.logProof?.envelopeHash, args.materialization.envelopeHash, "swooper-log.envelope-hash-mismatch");
  addNumberMismatch(unresolvedLinks, args.logProof?.dimensions.width, runtimeSummary.width, "runtime.log-width-mismatch");
  addNumberMismatch(unresolvedLinks, args.logProof?.dimensions.height, runtimeSummary.height, "runtime.log-height-mismatch");
  addStringMismatch(unresolvedLinks, localModScript?.sha256, deployedModScript?.sha256, "materialization.deployed-mod-script-hash-mismatch");

  return {
    status: unresolvedLinks.length === 0 ? "complete" : "unresolved",
    requestId: args.requestId,
    createdAt: args.createdAt ?? new Date().toISOString(),
    ...(args.sourceSnapshot ? { sourceSnapshot: args.sourceSnapshot } : {}),
    request: {
      ...(args.request?.recipeId === undefined ? {} : { recipeId: args.request.recipeId }),
      ...(args.request?.seed === undefined ? {} : { seed: args.request.seed }),
      ...(args.request?.mapSize === undefined ? {} : { mapSize: args.request.mapSize }),
      ...(args.request?.playerCount === undefined ? {} : { playerCount: args.request.playerCount }),
      ...(args.request?.resources === undefined ? {} : { resources: args.request.resources }),
      ...(args.request?.selectedConfigId === undefined ? {} : { selectedConfigId: args.request.selectedConfigId }),
      ...(args.request?.setupConfigSource === undefined ? {} : { setupConfigSource: args.request.setupConfigSource }),
      ...(args.request?.fingerprint === undefined ? {} : { fingerprint: args.request.fingerprint }),
    },
    materialization: {
      ...(args.materialization.mode === undefined ? {} : { mode: args.materialization.mode }),
      ...(args.materialization.path === undefined ? {} : { path: args.materialization.path }),
      ...(args.materialization.mapScript === undefined ? {} : { mapScript: args.materialization.mapScript }),
      ...(args.materialization.configHash === undefined ? {} : { configHash: args.materialization.configHash }),
      ...(args.materialization.envelopeHash === undefined ? {} : { envelopeHash: args.materialization.envelopeHash }),
      ...(sourceConfig ? { sourceConfig } : {}),
      ...(generatedSourceScript ? { generatedSourceScript } : {}),
      ...(localModScript ? { localModScript } : {}),
      ...(deployedModScript ? { deployedModScript } : {}),
    },
    civSetup: {
      ...(setupReadback.mapScript === undefined ? {} : { mapScript: setupReadback.mapScript }),
      ...(setupReadback.mapSize === undefined ? {} : { mapSize: setupReadback.mapSize }),
      ...(setupReadback.mapSeed === undefined ? {} : { mapSeed: setupReadback.mapSeed }),
      ...(setupReadback.gameSeed === undefined ? {} : { gameSeed: setupReadback.gameSeed }),
      ...(setupReadback.playerCount === undefined ? {} : { playerCount: setupReadback.playerCount }),
      ...(rowCount(args.rowProof) === undefined ? {} : { rowCount: rowCount(args.rowProof) }),
    },
    runtime: {
      ...(runtimeSummary.seed === undefined ? {} : { seed: runtimeSummary.seed }),
      ...(runtimeSummary.width === undefined ? {} : { width: runtimeSummary.width }),
      ...(runtimeSummary.height === undefined ? {} : { height: runtimeSummary.height }),
      ...(runtimeSummary.plotCount === undefined ? {} : { plotCount: runtimeSummary.plotCount }),
      ...(runtimeTurn === undefined ? {} : { turn: runtimeTurn }),
      ...(runtimeGameHash === undefined ? {} : { gameHash: runtimeGameHash }),
      ...(args.liveRuntimeSnapshot?.snapshotId ? { sourceSnapshotId: args.liveRuntimeSnapshot.snapshotId } : {}),
      ...(args.liveRuntimeSnapshot?.snapshotHash ? { snapshotHash: args.liveRuntimeSnapshot.snapshotHash } : {}),
    },
    ...(args.logProof ? { log: args.logProof } : {}),
    unresolvedLinks,
  };
}

function addMissing(links: string[], condition: boolean, link: string): void {
  if (!condition) links.push(link);
}

function addStringMismatch(links: string[], left: unknown, right: unknown, link: string): void {
  if (left === undefined || right === undefined) return;
  if (String(left) !== String(right)) links.push(link);
}

function addNumberMismatch(links: string[], left: unknown, right: unknown, link: string): void {
  if (left === undefined || right === undefined) return;
  const leftNumber = numberValue(left);
  const rightNumber = numberValue(right);
  if (leftNumber === undefined || rightNumber === undefined || leftNumber !== rightNumber) {
    links.push(link);
  }
}

export function parseSwooperMapgenLogProof(args: {
  text: string;
  logPath?: string;
  observedAt?: string;
  requestId: string;
  configHash: string;
  envelopeHash: string;
  seed: number;
}): RunInGameExactAuthorshipProof["log"] | undefined {
  const lines = args.text.split(/\r?\n/);
  const completionLine = lastSwooperPayloadLine(lines, "[mapgen-complete]", args);
  const proofLine = completionLine
    ? lastSwooperPayloadLine(lines, "[mapgen-proof]", args, { beforeIndex: completionLine.index })
    : lastSwooperPayloadLine(lines, "[mapgen-proof]", args);
  if (!proofLine || !completionLine) return undefined;
  const proofPayload = proofLine.payload;
  const completionPayload = completionLine.payload;
  const proofDimensions = dimensionsFromPayload(proofPayload);
  const completionDimensions = dimensionsFromPayload(completionPayload);
  if (
    !proofDimensions ||
    !completionDimensions ||
    proofDimensions.width !== completionDimensions.width ||
    proofDimensions.height !== completionDimensions.height
  ) {
    return undefined;
  }
  const resourcePlacement = parseResourcePlacementTelemetryBetween(
    lines,
    proofLine.index,
    completionLine.index
  );
  const naturalWonderPlacement = parseNaturalWonderPlacementTelemetryBetween(
    lines,
    proofLine.index,
    completionLine.index
  );
  const featureApply = parseFeatureApplyTelemetryBetween(
    lines,
    proofLine.index,
    completionLine.index
  );
  return {
    ...(args.logPath ? { logPath: args.logPath } : {}),
    ...(args.observedAt ? { observedAt: args.observedAt } : {}),
    requestId: args.requestId,
    configHash: args.configHash,
    envelopeHash: args.envelopeHash,
    seed: args.seed,
    ...(typeof proofPayload.mapSize === "string" ? { mapSize: proofPayload.mapSize } : {}),
    dimensions: proofDimensions,
    proofPayload,
    completionPayload,
    ...(featureApply ? { featureApply } : {}),
    ...(resourcePlacement ? { resourcePlacement } : {}),
    ...(naturalWonderPlacement ? { naturalWonderPlacement } : {}),
    matched: ["[mapgen-proof]", args.requestId, args.configHash, args.envelopeHash, "[mapgen-complete]"],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hashProofValue(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(canonicalize(value))).digest("hex");
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      const item = (value as Record<string, unknown>)[key];
      if (item !== undefined) out[key] = canonicalize(item);
    }
    return out;
  }
  return value;
}

function probeValue(value: unknown): unknown {
  return isRecord(value) && value.ok === true ? value.value : undefined;
}

function numberValue(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string" || value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function setupParameterValue(snapshot: unknown, id: string): unknown {
  if (!isRecord(snapshot) || !isRecord(snapshot.setup) || !Array.isArray(snapshot.setup.parameters)) return undefined;
  const parameter = snapshot.setup.parameters.find((item) =>
    isRecord(item) && item.id === id && item.exists !== false
  );
  return isRecord(parameter) ? parameter.value : undefined;
}

function setupReadbackFromSnapshot(snapshot: unknown): {
  mapScript?: string;
  mapSize?: unknown;
  mapSeed?: unknown;
  gameSeed?: unknown;
  playerCount?: unknown;
} {
  const mapScript = setupParameterValue(snapshot, "Map");
  const mapSize = setupParameterValue(snapshot, "MapSize");
  const mapSeed = setupParameterValue(snapshot, "MapRandomSeed");
  const gameSeed = setupParameterValue(snapshot, "GameRandomSeed");
  const config = isRecord(snapshot) && isRecord(snapshot.config) ? snapshot.config : {};
  const playerCount = setupParameterValue(snapshot, "PlayerCount") ?? probeValue(config.playerCount);
  return {
    ...(typeof mapScript === "string" ? { mapScript } : {}),
    ...(mapSize === undefined ? {} : { mapSize }),
    ...(mapSeed === undefined ? {} : { mapSeed }),
    ...(gameSeed === undefined ? {} : { gameSeed }),
    ...(playerCount === undefined ? {} : { playerCount }),
  };
}

function runtimeSummaryFromMapSummary(summary: unknown): {
  seed?: number;
  width?: number;
  height?: number;
  plotCount?: number;
  turn?: number;
  gameHash?: number;
} {
  if (!isRecord(summary)) return {};
  const map = isRecord(summary.map) ? summary.map : {};
  const game = isRecord(summary.game) ? summary.game : {};
  return {
    ...(typeof probeValue(map.randomSeed) === "number" ? { seed: probeValue(map.randomSeed) as number } : {}),
    ...(typeof probeValue(map.width) === "number" ? { width: probeValue(map.width) as number } : {}),
    ...(typeof probeValue(map.height) === "number" ? { height: probeValue(map.height) as number } : {}),
    ...(typeof probeValue(map.plotCount) === "number" ? { plotCount: probeValue(map.plotCount) as number } : {}),
    ...(typeof probeValue(game.turn) === "number" ? { turn: probeValue(game.turn) as number } : {}),
    ...(typeof probeValue(game.hash) === "number" ? { gameHash: probeValue(game.hash) as number } : {}),
  };
}

function rowCount(rowProof: unknown): number | undefined {
  if (!isRecord(rowProof) || !Array.isArray(rowProof.rows)) return undefined;
  return rowProof.rows.length;
}

function hasRows(rowProof: unknown): boolean {
  const count = rowCount(rowProof);
  return count !== undefined && count > 0;
}

function lastSwooperPayloadLine(
  lines: readonly string[],
  marker: "[mapgen-proof]" | "[mapgen-complete]",
  expected: Pick<Parameters<typeof parseSwooperMapgenLogProof>[0], "requestId" | "configHash" | "envelopeHash" | "seed">,
  options: { beforeIndex?: number } = {},
): { index: number; payload: Record<string, unknown> } | null {
  const startIndex = options.beforeIndex === undefined
    ? lines.length - 1
    : Math.min(options.beforeIndex - 1, lines.length - 1);
  for (let index = startIndex; index >= 0; index -= 1) {
    const line = lines[index] ?? "";
    if (!line.includes(marker)) continue;
    const payload = parsePayloadAfterMarker(line, marker);
    if (!payload) continue;
    if (payload.requestId !== expected.requestId) continue;
    if (payload.configHash !== expected.configHash) continue;
    if (payload.envelopeHash !== expected.envelopeHash) continue;
    if (payload.seed !== expected.seed) continue;
    return { index, payload };
  }
  return null;
}

function parseResourcePlacementTelemetryBetween(
  lines: readonly string[],
  proofIndex: number,
  completionIndex: number
): NonNullable<NonNullable<RunInGameExactAuthorshipProof["log"]>["resourcePlacement"]> | undefined {
  for (let index = completionIndex - 1; index > proofIndex; index -= 1) {
    const line = lines[index] ?? "";
    if (!line.includes("RESOURCE_PLACEMENT_V1")) continue;
    const payload = parsePayloadAfterMarker(line, "RESOURCE_PLACEMENT_V1");
    if (!payload) continue;
    return {
      marker: "RESOURCE_PLACEMENT_V1",
      payload,
      ...(resourcePlacementStats(payload) ?? {}),
      ...(resourcePlacementCoordinateProof(payload) ?? {}),
    };
  }
  return undefined;
}

function parseFeatureApplyTelemetryBetween(
  lines: readonly string[],
  proofIndex: number,
  completionIndex: number
): NonNullable<NonNullable<RunInGameExactAuthorshipProof["log"]>["featureApply"]> | undefined {
  for (let index = completionIndex - 1; index > proofIndex; index -= 1) {
    const line = lines[index] ?? "";
    if (!line.includes("FEATURE_APPLY_V1")) continue;
    const payload = parsePayloadAfterMarker(line, "FEATURE_APPLY_V1");
    if (!payload) continue;
    return {
      marker: "FEATURE_APPLY_V1",
      payload,
      ...(featureApplyStats(payload) ?? {}),
    };
  }
  return undefined;
}

function parseNaturalWonderPlacementTelemetryBetween(
  lines: readonly string[],
  proofIndex: number,
  completionIndex: number
): NonNullable<NonNullable<RunInGameExactAuthorshipProof["log"]>["naturalWonderPlacement"]> | undefined {
  for (let index = completionIndex - 1; index > proofIndex; index -= 1) {
    const line = lines[index] ?? "";
    if (!line.includes("NATURAL_WONDER_PLACEMENT_V1")) continue;
    const payload = parsePayloadAfterMarker(line, "NATURAL_WONDER_PLACEMENT_V1");
    if (!payload) continue;
    return {
      marker: "NATURAL_WONDER_PLACEMENT_V1",
      payload,
      ...(naturalWonderPlacementStats(payload) ?? {}),
      ...(naturalWonderPlacementCoordinateProof(payload) ?? {}),
    };
  }
  return undefined;
}

function featureApplyStats(
  payload: Record<string, unknown>
):
  | {
      stats: NonNullable<NonNullable<RunInGameExactAuthorshipProof["log"]>["featureApply"]>["stats"];
    }
  | undefined {
  const attempted = numberValue(payload.attempted);
  const applied = numberValue(payload.applied);
  const rejected = numberValue(payload.rejected);
  const rejectedCanHaveFeature = numberValue(payload.rejectedCanHaveFeature);
  if (
    attempted === undefined ||
    applied === undefined ||
    rejected === undefined ||
    rejectedCanHaveFeature === undefined
  ) {
    return undefined;
  }
  return {
    stats: {
      attempted,
      applied,
      rejected,
      rejectedCanHaveFeature,
      ...countRecordField(payload, "attemptedByFeature"),
      ...countRecordField(payload, "appliedByFeature"),
      ...countRecordField(payload, "rejectedCanHaveFeatureByFeature"),
    },
  };
}

function naturalWonderPlacementStats(
  payload: Record<string, unknown>
):
  | {
      stats: NonNullable<
        NonNullable<NonNullable<RunInGameExactAuthorshipProof["log"]>["naturalWonderPlacement"]>["stats"]
      >;
    }
  | undefined {
  const version = numberValue(payload.version);
  const plannedCount = numberValue(payload.plannedCount);
  const targetCount = numberValue(payload.targetCount);
  const placedCount = numberValue(payload.placedCount);
  const terrainAdjustedCount = numberValue(payload.terrainAdjustedCount);
  const skippedOutOfBoundsCount = numberValue(payload.skippedOutOfBoundsCount);
  const rejectedCount = numberValue(payload.rejectedCount);
  const shortfallCount = numberValue(payload.shortfallCount);
  const rejectionExamples = Array.isArray(payload.rejectionExamples)
    ? payload.rejectionExamples.filter((entry): entry is string => typeof entry === "string").slice(0, 8)
    : undefined;
  if (
    version === undefined ||
    plannedCount === undefined ||
    targetCount === undefined ||
    placedCount === undefined ||
    terrainAdjustedCount === undefined ||
    skippedOutOfBoundsCount === undefined ||
    rejectedCount === undefined ||
    shortfallCount === undefined
  ) {
    return undefined;
  }
  const rejectionExampleCount = numberValue(payload.rejectionExampleCount);
  return {
    stats: {
      version,
      plannedCount,
      targetCount,
      placedCount,
      terrainAdjustedCount,
      skippedOutOfBoundsCount,
      rejectedCount,
      shortfallCount,
      ...(rejectionExampleCount === undefined ? {} : { rejectionExampleCount }),
      ...(rejectionExamples === undefined ? {} : { rejectionExamples }),
    },
  };
}

function resourcePlacementStats(
  payload: Record<string, unknown>
):
  | {
      stats: NonNullable<
        NonNullable<NonNullable<RunInGameExactAuthorshipProof["log"]>["resourcePlacement"]>["stats"]
      >;
    }
  | undefined {
  const version = numberValue(payload.version);
  const plannedCount = numberValue(payload.plannedCount);
  const placedCount = numberValue(payload.placedCount);
  const rejectedCount = numberValue(payload.rejectedCount);
  const mismatchCount = numberValue(payload.mismatchCount);
  const rejectionExamples = Array.isArray(payload.rejectionExamples)
    ? payload.rejectionExamples.filter((entry): entry is string => typeof entry === "string").slice(0, 8)
    : undefined;
  if (
    version === undefined ||
    plannedCount === undefined ||
    placedCount === undefined ||
    rejectedCount === undefined ||
    mismatchCount === undefined
  ) {
    return undefined;
  }
  const rejectionExampleCount = numberValue(payload.rejectionExampleCount);
  return {
    stats: {
      version,
      plannedCount,
      placedCount,
      rejectedCount,
      mismatchCount,
      ...(rejectionExampleCount === undefined ? {} : { rejectionExampleCount }),
      ...(rejectionExamples === undefined ? {} : { rejectionExamples }),
    },
  };
}

function naturalWonderPlacementCoordinateProof(
  payload: Record<string, unknown>
):
  | {
      coordinateProof: NonNullable<
        NonNullable<NonNullable<RunInGameExactAuthorshipProof["log"]>["naturalWonderPlacement"]>["coordinateProof"]
      >;
    }
  | undefined {
  const coordinateProof = isRecord(payload.coordinateProof) ? payload.coordinateProof : undefined;
  if (!coordinateProof) return undefined;
  const version = numberValue(coordinateProof.version);
  const placedCount = numberValue(coordinateProof.placedCount);
  const placedHash32 = hash32Value(coordinateProof.placedHash32);
  if (version === undefined || placedCount === undefined || placedHash32 === undefined) return undefined;
  const rejectedCount = numberValue(coordinateProof.rejectedCount);
  const rejectedHash32 = hash32Value(coordinateProof.rejectedHash32);
  return {
    coordinateProof: {
      version,
      placed: { count: placedCount, hash32: placedHash32 },
      ...(rejectedCount === undefined || rejectedHash32 === undefined
        ? {}
        : { rejected: { count: rejectedCount, hash32: rejectedHash32 } }),
    },
  };
}

function resourcePlacementCoordinateProof(
  payload: Record<string, unknown>
):
  | {
      coordinateProof: NonNullable<
        NonNullable<NonNullable<RunInGameExactAuthorshipProof["log"]>["resourcePlacement"]>["coordinateProof"]
      >;
    }
  | undefined {
  const coordinateProof = isRecord(payload.coordinateProof) ? payload.coordinateProof : undefined;
  if (!coordinateProof) return undefined;
  const version = numberValue(coordinateProof.version);
  const placedCount = numberValue(coordinateProof.placedCount);
  const placedHash32 = hash32Value(coordinateProof.placedHash32);
  if (version === undefined || placedCount === undefined || placedHash32 === undefined) return undefined;
  const rejectedCount = numberValue(coordinateProof.rejectedCount);
  const rejectedHash32 = hash32Value(coordinateProof.rejectedHash32);
  const mismatchCount = numberValue(coordinateProof.mismatchCount);
  const mismatchHash32 = hash32Value(coordinateProof.mismatchHash32);
  return {
    coordinateProof: {
      version,
      placed: { count: placedCount, hash32: placedHash32 },
      ...(rejectedCount === undefined || rejectedHash32 === undefined
        ? {}
        : { rejected: { count: rejectedCount, hash32: rejectedHash32 } }),
      ...(mismatchCount === undefined || mismatchHash32 === undefined
        ? {}
        : { mismatch: { count: mismatchCount, hash32: mismatchHash32 } }),
    },
  };
}

function countRecordField(
  payload: Record<string, unknown>,
  field: "attemptedByFeature" | "appliedByFeature" | "rejectedCanHaveFeatureByFeature"
): Partial<Record<typeof field, Readonly<Record<string, number>>>> {
  const source = isRecord(payload[field]) ? payload[field] : undefined;
  if (!source) return {};
  const entries = Object.entries(source)
    .map(([key, value]) => [key, numberValue(value)] as const)
    .filter((entry): entry is readonly [string, number] => entry[1] !== undefined)
    .sort(([left], [right]) => left.localeCompare(right));
  return entries.length === 0 ? {} : { [field]: Object.fromEntries(entries) };
}

function parsePayloadAfterMarker(line: string, marker: string): Record<string, unknown> | null {
  const markerIndex = line.indexOf(marker);
  if (markerIndex < 0) return null;
  const jsonStart = line.indexOf("{", markerIndex + marker.length);
  if (jsonStart < 0) return null;
  try {
    const payload = JSON.parse(line.slice(jsonStart)) as unknown;
    return isRecord(payload) ? payload : null;
  } catch {
    return null;
  }
}

function hash32Value(value: unknown): string | undefined {
  return typeof value === "string" && /^[0-9a-f]{8}$/.test(value) ? value : undefined;
}

function dimensionsFromPayload(payload: Record<string, unknown>): { width: number; height: number } | null {
  if (!isRecord(payload.dimensions)) return null;
  const { width, height } = payload.dimensions;
  return typeof width === "number" && typeof height === "number" ? { width, height } : null;
}
