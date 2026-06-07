export type LiveRuntimeStatusKind = "idle" | "ok" | "error";

export type LiveRuntimeSnapshotStatus = "idle" | "loading" | "ok" | "stale" | "error";

export type LiveRuntimeBindingStatus =
  | "unbound-runtime"
  | "proven-studio-run"
  | "stale"
  | "partial"
  | "failed";

export type LiveRuntimeStatusState = Readonly<{
  status: LiveRuntimeStatusKind;
  turn?: number;
  gameHash?: number;
  seed?: number;
  readiness?: string;
  autoplayActive?: boolean;
  autoplayPaused?: boolean;
  updatedAt?: string;
  error?: string;
  snapshotStatus?: LiveRuntimeSnapshotStatus;
  snapshotId?: string;
  snapshotHash?: string;
  bindingStatus?: LiveRuntimeBindingStatus;
  failureCount?: number;
}>;

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

type LiveStatusBody = Readonly<{
  ok?: boolean;
  observedAt?: string;
  status?: {
    readiness?: string;
    error?: string;
  };
  mapSummary?: {
    error?: string;
    map?: {
      randomSeed?: { ok?: boolean; value?: number };
      width?: { ok?: boolean; value?: number };
      height?: { ok?: boolean; value?: number };
    };
    game?: {
      turn?: { ok?: boolean; value?: number };
      hash?: { ok?: boolean; value?: number };
    };
  };
  autoplay?: {
    autoplay?: {
      isActive?: boolean;
      isPaused?: boolean;
    };
  };
}>;

const DEFAULT_VISIBLE_SNAPSHOT_BOUNDS: LiveRuntimeSnapshotBounds = {
  x: 0,
  y: 0,
  width: 8,
  height: 8,
};

const DEFAULT_VISIBLE_SNAPSHOT_FIELDS = ["terrain", "biome", "feature", "resource"] as const;

export function stableLiveRuntimeStringify(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

export function hashLiveRuntimeValue(value: unknown): string {
  const input = stableLiveRuntimeStringify(value);
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function buildLiveRuntimeStatusState(args: {
  body: LiveStatusBody;
  observedAtFallback: string;
  failureCount?: number;
  bindingStatus?: LiveRuntimeBindingStatus;
}): LiveRuntimeStatusState {
  const observedAt = args.body.observedAt ?? args.observedAtFallback;
  const turn = args.body.mapSummary?.game?.turn?.ok ? args.body.mapSummary.game.turn.value : undefined;
  const gameHash = args.body.mapSummary?.game?.hash?.ok ? args.body.mapSummary.game.hash.value : undefined;
  const seed = args.body.mapSummary?.map?.randomSeed?.ok ? args.body.mapSummary.map.randomSeed.value : undefined;
  const readiness = args.body.status?.readiness;
  const ok = Boolean(args.body.ok);
  const snapshotHash = hashLiveRuntimeValue({
    turn,
    gameHash,
    seed,
    readiness,
    map: args.body.mapSummary?.map,
    autoplay: args.body.autoplay?.autoplay,
  });
  return {
    status: ok ? "ok" : "error",
    ...(turn === undefined ? {} : { turn }),
    ...(gameHash === undefined ? {} : { gameHash }),
    ...(seed === undefined ? {} : { seed }),
    ...(readiness === undefined ? {} : { readiness }),
    autoplayActive: args.body.autoplay?.autoplay?.isActive,
    autoplayPaused: args.body.autoplay?.autoplay?.isPaused,
    updatedAt: observedAt,
    snapshotStatus: ok ? "idle" : "error",
    snapshotHash,
    snapshotId: `status:${turn ?? "unknown"}:${snapshotHash}`,
    bindingStatus: ok ? args.bindingStatus ?? "unbound-runtime" : "failed",
    failureCount: args.failureCount ?? 0,
    error: ok ? undefined : args.body.status?.error ?? args.body.mapSummary?.error ?? "Live status unavailable",
  };
}

export function buildLiveRuntimeErrorState(args: {
  error: unknown;
  observedAt: string;
  failureCount: number;
}): LiveRuntimeStatusState {
  return {
    status: "error",
    updatedAt: args.observedAt,
    error: args.error instanceof Error ? args.error.message : "Live status unavailable",
    snapshotStatus: "error",
    bindingStatus: "failed",
    failureCount: args.failureCount,
  };
}

export function nextLiveRuntimePollDelayMs(args: {
  failureCount: number;
  documentHidden: boolean;
}): number {
  if (args.documentHidden) return Math.min(30_000, 5_000 * Math.max(1, args.failureCount + 1));
  if (args.failureCount <= 0) return 3_000;
  return Math.min(30_000, 3_000 * 2 ** Math.min(args.failureCount - 1, 4));
}

export function buildLiveRuntimeSnapshotRequest(args: {
  status: LiveRuntimeStatusState;
  bounds?: LiveRuntimeSnapshotBounds;
  fields?: ReadonlyArray<string>;
  maxPlots?: number;
  playerId?: number;
}): LiveRuntimeSnapshotRequest | null {
  if (args.status.status !== "ok" || !args.status.snapshotId) return null;
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
