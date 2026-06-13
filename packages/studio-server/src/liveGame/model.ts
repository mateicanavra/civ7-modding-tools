import { Type, type Static } from "typebox";

export const liveGameStatusKindSchema = Type.Union([
  Type.Literal("idle"),
  Type.Literal("ok"),
  Type.Literal("error"),
]);

export const liveGameSnapshotStatusSchema = Type.Union([
  Type.Literal("idle"),
  Type.Literal("loading"),
  Type.Literal("ok"),
  Type.Literal("stale"),
  Type.Literal("error"),
]);

export const liveGameBindingStatusSchema = Type.Union([
  Type.Literal("unbound-runtime"),
  Type.Literal("proven-studio-run"),
  Type.Literal("stale"),
  Type.Literal("partial"),
  Type.Literal("failed"),
]);

export const liveGameStateSchema = Type.Object(
  {
    status: liveGameStatusKindSchema,
    turn: Type.Optional(Type.Number()),
    gameHash: Type.Optional(Type.Number()),
    seed: Type.Optional(Type.Number()),
    readiness: Type.Optional(Type.String()),
    autoplayActive: Type.Optional(Type.Boolean()),
    autoplayPaused: Type.Optional(Type.Boolean()),
    updatedAt: Type.Optional(Type.String()),
    error: Type.Optional(Type.String()),
    snapshotStatus: Type.Optional(liveGameSnapshotStatusSchema),
    snapshotId: Type.Optional(Type.String()),
    snapshotHash: Type.Optional(Type.String()),
    bindingStatus: Type.Optional(liveGameBindingStatusSchema),
    failureCount: Type.Optional(Type.Number()),
  },
  { additionalProperties: false }
);

export type LiveGameStatusKind = Static<typeof liveGameStatusKindSchema>;
export type LiveGameSnapshotStatus = Static<typeof liveGameSnapshotStatusSchema>;
export type LiveGameBindingStatus = Static<typeof liveGameBindingStatusSchema>;
export type LiveGameState = Readonly<Static<typeof liveGameStateSchema>>;

export type LiveGameStatusBody = Readonly<{
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

export function stableLiveGameStringify(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

export function hashLiveGameValue(value: unknown): string {
  const input = stableLiveGameStringify(value);
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function buildLiveGameState(args: {
  body: LiveGameStatusBody;
  observedAtFallback: string;
  failureCount?: number;
  bindingStatus?: LiveGameBindingStatus;
}): LiveGameState {
  const observedAt = args.body.observedAt ?? args.observedAtFallback;
  const turn = args.body.mapSummary?.game?.turn?.ok
    ? args.body.mapSummary.game.turn.value
    : undefined;
  const gameHash = args.body.mapSummary?.game?.hash?.ok
    ? args.body.mapSummary.game.hash.value
    : undefined;
  const seed = args.body.mapSummary?.map?.randomSeed?.ok
    ? args.body.mapSummary.map.randomSeed.value
    : undefined;
  const readiness = args.body.status?.readiness;
  const ok = Boolean(args.body.ok);
  const snapshotHash = hashLiveGameValue({
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
    bindingStatus: ok ? (args.bindingStatus ?? "unbound-runtime") : "failed",
    failureCount: args.failureCount ?? 0,
    error: ok
      ? undefined
      : (args.body.status?.error ?? args.body.mapSummary?.error ?? "Live status unavailable"),
  };
}

export function buildLiveGameErrorState(args: {
  error: unknown;
  observedAt: string;
  failureCount: number;
}): LiveGameState {
  return {
    status: "error",
    updatedAt: args.observedAt,
    error: args.error instanceof Error ? args.error.message : "Live status unavailable",
    snapshotStatus: "error",
    bindingStatus: "failed",
    failureCount: args.failureCount,
  };
}

export function liveGameStateKey(state: LiveGameState): string {
  if (state.status === "ok" && state.snapshotId) return `ok:${state.snapshotId}`;
  return stableLiveGameStringify({
    status: state.status,
    error: state.error,
    readiness: state.readiness,
    snapshotId: state.snapshotId,
    snapshotHash: state.snapshotHash,
    bindingStatus: state.bindingStatus,
  });
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
