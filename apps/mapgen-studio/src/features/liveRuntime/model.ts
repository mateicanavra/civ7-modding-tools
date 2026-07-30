import { CIV7_GAME_RANDOM_SEED_PARAMETER_DESCRIPTOR } from "@civ7/map-policy/setup";
import {
  buildLiveGameState,
  type Civ7SetupParameter,
  type Civ7SetupSnapshot,
  hashLiveGameValue,
  type LiveGameBindingStatus,
  type LiveGameSnapshotStatus,
  type LiveGameState,
  type LiveGameStatusBody,
  stableLiveGameStringify,
} from "@civ7/studio-contract";
import { parseCiv7StudioSeed } from "../civ7Setup/seedPolicy";

type LiveRuntimeSnapshotStatus = LiveGameSnapshotStatus;

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

type LiveRuntimeSuggestionRecordBase = Readonly<{
  id: string;
  sourceSnapshotId?: string;
  createdAt: string;
  confidence: "observed-runtime" | "proved-studio-run";
  applyPath: "visible-studio-control";
}>;

/** One typed Studio-authoring change supported by exact live-runtime evidence. */
export type LiveRuntimeSuggestionRecord = Readonly<
  | (LiveRuntimeSuggestionRecordBase & {
      affectedConfigPath: "seed" | "gameSeed";
      value: string;
    })
  | (LiveRuntimeSuggestionRecordBase & {
      affectedConfigPath: "setupConfig";
      value: unknown;
    })
>;

type LiveStatusBody = LiveGameStatusBody;

const DEFAULT_VISIBLE_SNAPSHOT_BOUNDS: LiveRuntimeSnapshotBounds = {
  x: 0,
  y: 0,
  width: 8,
  height: 8,
};

const DEFAULT_VISIBLE_SNAPSHOT_FIELDS = ["terrain", "biome", "feature", "resource"] as const;

function stableLiveRuntimeStringify(value: unknown): string {
  return stableLiveGameStringify(value);
}

function hashLiveRuntimeValue(value: unknown): string {
  return hashLiveGameValue(value);
}

/** Normalizes a live-status body through the shared Studio contract state model. */
export function buildLiveRuntimeStatusState(args: {
  body: LiveStatusBody;
  observedAtFallback: string;
  failureCount?: number;
  bindingStatus?: LiveRuntimeBindingStatus;
}): LiveRuntimeStatusState {
  return buildLiveGameState(args);
}

/** Builds a bounded snapshot request only when live status identifies a readable snapshot. */
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

/** Admits a snapshot result only while its request remains active and unaborted. */
export function shouldCommitLiveRuntimeSnapshot(args: {
  activeRequestKey: string | null;
  resultRequestKey: string;
  aborted?: boolean;
}): boolean {
  return !args.aborted && args.activeRequestKey === args.resultRequestKey;
}

/** Fingerprints the live evidence that can change a setup refresh result. */
export function buildLiveRuntimeSetupRequestKey(status: LiveRuntimeStatusState): string {
  return stableLiveRuntimeStringify({
    snapshotId: status.snapshotId,
    snapshotHash: status.snapshotHash,
    turn: status.turn,
    seed: status.seed,
    gameHash: status.gameHash,
    status: status.status,
  });
}

/** Admits a setup refresh only while its evidence key remains current and unaborted. */
export function shouldCommitLiveRuntimeSetup(args: {
  activeRequestKey: string | null;
  resultRequestKey: string;
  aborted?: boolean;
}): boolean {
  return !args.aborted && args.activeRequestKey === args.resultRequestKey;
}

/** Encodes the admitted snapshot bounds and fields for the Studio live-reader endpoint. */
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

/** Projects a snapshot response into terminal client state with a content-derived identity. */
export function buildLiveRuntimeSnapshotState(args: {
  request: LiveRuntimeSnapshotRequest;
  body: unknown;
  observedAtFallback: string;
}): LiveRuntimeSnapshotState {
  if (!isRecord(args.body) || args.body.ok !== true) {
    return {
      status: "error",
      requestKey: args.request.key,
      error:
        isRecord(args.body) && typeof args.body.error === "string"
          ? args.body.error
          : "Live snapshot unavailable",
    };
  }
  const observedAt =
    typeof args.body.observedAt === "string" ? args.body.observedAt : args.observedAtFallback;
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

/** Emits visible-control suggestions only for runtime values backed by the supplied evidence. */
export function buildLiveRuntimeSuggestionRecords(args: {
  sourceSnapshotId?: string;
  seed?: number;
  gameSeed?: number;
  setupConfig?: unknown;
  provedStudioRun?: boolean;
  now?: () => Date;
}): ReadonlyArray<LiveRuntimeSuggestionRecord> {
  const createdAt = (args.now ?? (() => new Date()))().toISOString();
  const confidence = args.provedStudioRun ? "proved-studio-run" : "observed-runtime";
  const prefix =
    args.sourceSnapshotId ??
    `runtime:${hashLiveRuntimeValue({
      seed: args.seed,
      gameSeed: args.gameSeed,
      setupConfig: args.setupConfig,
    })}`;
  const records: LiveRuntimeSuggestionRecord[] = [];
  if (args.seed !== undefined) {
    records.push({
      id: `${prefix}:seed`,
      sourceSnapshotId: args.sourceSnapshotId,
      createdAt,
      confidence,
      affectedConfigPath: "seed",
      value: String(args.seed),
      applyPath: "visible-studio-control",
    });
  }
  if (args.gameSeed !== undefined) {
    records.push({
      id: `${prefix}:gameSeed`,
      sourceSnapshotId: args.sourceSnapshotId,
      createdAt,
      confidence,
      affectedConfigPath: "gameSeed",
      value: String(args.gameSeed),
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

/**
 * Selects an observed Civ7 lifecycle game seed without treating authorability as evidence quality.
 * Hidden or read-only parameters remain valid observations; absent, destroyed, refused, and
 * malformed values do not become Studio suggestions.
 */
export function selectLiveRuntimeGameSeed(snapshot: Civ7SetupSnapshot): number | undefined {
  const parameter = snapshot.parameters.find(
    ({ id }) => id === CIV7_GAME_RANDOM_SEED_PARAMETER_DESCRIPTOR.parameterId
  );
  if (!parameter || !isAvailableLiveObservation(parameter)) return undefined;
  const parsed = parseCiv7StudioSeed(parameter.value);
  return parsed.ok ? parsed.value : undefined;
}

function isAvailableLiveObservation(parameter: Civ7SetupParameter): boolean {
  const { invalidReason } = parameter;
  return (
    parameter.exists === true &&
    parameter.destroyed !== true &&
    (invalidReason === undefined ||
      invalidReason === null ||
      invalidReason === 0 ||
      invalidReason === "")
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
