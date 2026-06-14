import {
  buildLiveGameErrorState,
  buildLiveGameState,
  hashLiveGameValue,
  stableLiveGameStringify,
  type LiveGameBindingStatus,
  type LiveGameSnapshotStatus,
  type LiveGameState,
  type LiveGameStatusBody,
  type LiveGameStatusKind,
} from "@civ7/studio-server/live-game";

export type LiveRuntimeStatusKind = LiveGameStatusKind;

export type LiveRuntimeSnapshotStatus = LiveGameSnapshotStatus;

export type LiveRuntimeBindingStatus = LiveGameBindingStatus;

export type LiveRuntimeStatusState = LiveGameState;

export type LiveRuntimeSnapshotBounds = Readonly<{
  x: number;
  y: number;
  width: number;
  height: number;
}>;

export type LiveRuntimeSnapshotRequest = Readonly<{
  key: string;
  sourceSnapshotId: string;
  turn?: number;
  bounds: LiveRuntimeSnapshotBounds;
  fields: ReadonlyArray<string>;
  maxPlots: number;
  playerId?: number;
}>;

export type LiveRuntimeSnapshotState = Readonly<{
  status: Exclude<LiveRuntimeSnapshotStatus, "idle" | "loading">;
  requestKey: string;
  snapshotId?: string;
  snapshotHash?: string;
  observedAt?: string;
  error?: string;
}>;

export type LiveRuntimeSuggestionRecord = Readonly<{
  id: string;
  sourceSnapshotId?: string;
  createdAt: string;
  confidence: "observed-runtime" | "proved-studio-run";
  affectedConfigPath: string;
  value: unknown;
  applyPath: "visible-studio-control";
}>;

type LiveStatusBody = LiveGameStatusBody;

const DEFAULT_VISIBLE_SNAPSHOT_BOUNDS: LiveRuntimeSnapshotBounds = {
  x: 0,
  y: 0,
  width: 8,
  height: 8,
};

const DEFAULT_VISIBLE_SNAPSHOT_FIELDS = ["terrain", "biome", "feature", "resource"] as const;

export function stableLiveRuntimeStringify(value: unknown): string {
  return stableLiveGameStringify(value);
}

export function hashLiveRuntimeValue(value: unknown): string {
  return hashLiveGameValue(value);
}

export function buildLiveRuntimeStatusState(args: {
  body: LiveStatusBody;
  observedAtFallback: string;
  failureCount?: number;
  bindingStatus?: LiveRuntimeBindingStatus;
}): LiveRuntimeStatusState {
  return buildLiveGameState(args);
}

export function buildLiveRuntimeErrorState(args: {
  error: unknown;
  observedAt: string;
  failureCount: number;
}): LiveRuntimeStatusState {
  return buildLiveGameErrorState(args);
}

export function buildLiveRuntimeSnapshotRequest(args: {
  status: LiveRuntimeStatusState;
  bounds?: LiveRuntimeSnapshotBounds;
  fields?: ReadonlyArray<string>;
  maxPlots?: number;
  playerId?: number;
}): LiveRuntimeSnapshotRequest | null {
  if (args.status.status !== "ok" || !args.status.snapshotId) return null;
  if (args.status.readiness !== "tuner-ready") return null;
  const bounds = args.bounds ?? DEFAULT_VISIBLE_SNAPSHOT_BOUNDS;
  const fields = args.fields ?? DEFAULT_VISIBLE_SNAPSHOT_FIELDS;
  const maxPlots = Math.min(512, Math.max(1, args.maxPlots ?? 64));
  const key = stableLiveRuntimeStringify({
    sourceSnapshotId: args.status.snapshotId,
    turn: args.status.turn,
    bounds,
    fields,
    maxPlots,
    playerId: args.playerId,
  });
  return {
    key,
    sourceSnapshotId: args.status.snapshotId,
    ...(args.status.turn === undefined ? {} : { turn: args.status.turn }),
    bounds,
    fields,
    maxPlots,
    ...(args.playerId === undefined ? {} : { playerId: args.playerId }),
  };
}

export function shouldCommitLiveRuntimeSnapshot(args: {
  activeRequestKey: string | null;
  resultRequestKey: string;
  aborted?: boolean;
}): boolean {
  return !args.aborted && args.activeRequestKey === args.resultRequestKey;
}

export function buildLiveRuntimeSnapshotQuery(request: LiveRuntimeSnapshotRequest): string {
  const params = new URLSearchParams({
    x: String(request.bounds.x),
    y: String(request.bounds.y),
    width: String(request.bounds.width),
    height: String(request.bounds.height),
    fields: request.fields.join(","),
    maxPlots: String(request.maxPlots),
  });
  if (request.playerId !== undefined) params.set("playerId", String(request.playerId));
  return params.toString();
}

export function buildLiveRuntimeSnapshotState(args: {
  request: LiveRuntimeSnapshotRequest;
  body: unknown;
  observedAtFallback: string;
}): LiveRuntimeSnapshotState {
  if (!isRecord(args.body) || args.body.ok !== true) {
    return {
      status: "error",
      requestKey: args.request.key,
      error: isRecord(args.body) && typeof args.body.error === "string" ? args.body.error : "Live snapshot unavailable",
    };
  }
  const observedAt = typeof args.body.observedAt === "string" ? args.body.observedAt : args.observedAtFallback;
  const snapshotHash = hashLiveRuntimeValue({
    request: args.request,
    grid: args.body.grid,
  });
  return {
    status: "ok",
    requestKey: args.request.key,
    observedAt,
    snapshotHash,
    snapshotId: `snapshot:${args.request.turn ?? "unknown"}:${snapshotHash}`,
  };
}

export function buildLiveRuntimeSuggestionRecords(args: {
  sourceSnapshotId?: string;
  seed?: number;
  setupConfig?: unknown;
  provedStudioRun?: boolean;
  now?: () => Date;
}): ReadonlyArray<LiveRuntimeSuggestionRecord> {
  const createdAt = (args.now ?? (() => new Date()))().toISOString();
  const confidence = args.provedStudioRun ? "proved-studio-run" : "observed-runtime";
  const prefix = args.sourceSnapshotId ?? `runtime:${hashLiveRuntimeValue({ seed: args.seed, setupConfig: args.setupConfig })}`;
  const records: LiveRuntimeSuggestionRecord[] = [];
  if (args.seed !== undefined) {
    records.push({
      id: `${prefix}:seed`,
      sourceSnapshotId: args.sourceSnapshotId,
      createdAt,
      confidence,
      affectedConfigPath: "recipeSettings.seed",
      value: String(args.seed),
      applyPath: "visible-studio-control",
    });
  }
  if (args.setupConfig !== undefined && args.setupConfig !== null) {
    records.push({
      id: `${prefix}:setupConfig`,
      sourceSnapshotId: args.sourceSnapshotId,
      createdAt,
      confidence,
      affectedConfigPath: "setupConfig",
      value: args.setupConfig,
      applyPath: "visible-studio-control",
    });
  }
  return records;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
