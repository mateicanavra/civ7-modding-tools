import type { Router } from "@orpc/server";
import { ORPCError } from "@orpc/server";
import { Effect } from "effect";
import { implementEffect } from "effect-orpc";

import { contract, type StudioContract } from "../contract/index.js";
import { errorMessage, orpcError } from "../errors.js";
import type { StudioRuntime } from "../runtime.js";
import { Civ7TunerClient } from "../services/Civ7TunerClient.js";
import { StudioConfig } from "../services/StudioConfig.js";

/**
 * effect-orpc router for `@civ7/studio-server` (slice A3).
 *
 * This is the ONLY module that imports `effect-orpc` (research/01 §6 isolation
 * rule). Each leaf is `implementEffect(...).<ns>.<proc>.effect(function*(){…})`.
 * The procedure bodies lift the corresponding `/api/*` handler logic from
 * `apps/mapgen-studio/vite.config.ts` verbatim:
 *
 *   - Read procedures call `Civ7TunerClient` (→ `@civ7/direct-control`) and map a
 *     failure to the EXACT legacy status code via `orpcError(...)`. The codes are
 *     NON-UNIFORM (gameInfo/live.* → 400, setupConfig → 503, most → 500) — the
 *     do-not-break registry (architecture/10 §7).
 *   - `civ7.live.status` runs the four reads under `Effect.all({ mode: "either" })`
 *     (the `Promise.allSettled` analogue) and embeds `{ error }` per field at 200;
 *     only an outer defect yields a transport error. PARITY INVARIANT.
 *   - The three stateful engines (autoplay #8, runInGame #13/#14, mapConfigs
 *     #15/#16) delegate to the host-injected `StudioConfig` fns (shared queue +
 *     dual-store mutex live host-side; see ../context.ts) and re-throw the engine's
 *     `ORPCError` unchanged so its 409/400/404/500/503 status + `data` survive.
 *
 * Query parsing parity (clamps, csv split/trim/filter, playerId omit) that the
 * legacy handlers did from the URL is reproduced here against the typed input.
 */
// Return type is the CONTRACT-DERIVED `Router<StudioContract, …>` rather than the
// lossy `AnyRouter`: the effect-orpc `oe.router(...)` result is pinned to
// `StudioContract`, and its initial context is fully provided by the injected
// `ManagedRuntime` (so `Record<never, never>`). Annotating it portably (instead of
// inferring `EnhancedRouter<…>`, which would reference effect-orpc internals and
// trip TS2742 in the emitted `.d.ts`) keeps `StudioRouter` contract-typed.
export function createStudioRouter(
  runtime: StudioRuntime,
): Router<StudioContract, Record<never, never>> {
  const oe = implementEffect(contract, runtime);

  return oe.router({
    civ7: {
      // #1 GET /api/civ7/status — error 500
      status: oe.civ7.status.effect(function* () {
        const status = yield* Civ7TunerClient.playableStatus().pipe(
          Effect.mapError((err) => orpcError(500, errorMessage(err, "Civ7 status request failed"))),
        );
        return { ok: status.playable, status: status as Record<string, unknown> };
      }),

      // #2 GET /api/civ7/map-summary — error 500
      mapSummary: oe.civ7.mapSummary.effect(function* () {
        const summary = yield* Civ7TunerClient.mapSummary().pipe(
          Effect.mapError((err) =>
            orpcError(500, errorMessage(err, "Civ7 map summary request failed")),
          ),
        );
        return { ok: true as const, summary: summary as Record<string, unknown> };
      }),

      // #3 GET /api/civ7/gameinfo?table=&limit= — error 400 (NOT 500)
      gameInfo: oe.civ7.gameInfo.effect(function* ({ input }) {
        const rows = yield* Civ7TunerClient.gameInfoRows(input.table, input.limit).pipe(
          Effect.mapError((err) =>
            orpcError(400, errorMessage(err, "Civ7 GameInfo request failed")),
          ),
        );
        // Parity: legacy `/api` writes the WHOLE result object under `rows`.
        return { ok: true as const, rows: rows as unknown as Record<string, unknown> };
      }),

      // #8 POST /api/civ7/autoplay — host engine; 409 mutex / 400 / 500
      autoplay: oe.civ7.autoplay.effect(function* ({ input }) {
        const config = yield* StudioConfig;
        return yield* Effect.tryPromise({
          try: () => config.autoplay(input),
          catch: (err) => err,
        }).pipe(Effect.mapError(rethrowEngineError("Civ7 autoplay request failed", 500)));
      }),

      // #10 GET /api/civ7/setup-config — error 503 (UNIQUE), body carries observedAt
      setupConfig: oe.civ7.setupConfig.effect(function* () {
        const snapshot = yield* Civ7TunerClient.setupSnapshot().pipe(
          Effect.mapError((err) =>
            orpcError(503, errorMessage(err, "Civ7 setup config unavailable"), {
              observedAt: new Date().toISOString(),
            }),
          ),
        );
        return {
          ok: true as const,
          observedAt: new Date().toISOString(),
          setup: snapshot.snapshot as Record<string, unknown>,
          state: snapshot.state as Record<string, unknown>,
          host: snapshot.host,
          port: snapshot.port,
        };
      }),

      // #11 GET /api/civ7/saved-configs — error 500, body carries observedAt
      savedConfigs: oe.civ7.savedConfigs.effect(function* () {
        const result = yield* Civ7TunerClient.savedConfigurations().pipe(
          Effect.mapError((err) =>
            orpcError(500, errorMessage(err, "Civ7 saved configurations unavailable"), {
              observedAt: new Date().toISOString(),
            }),
          ),
        );
        return {
          ok: true as const,
          observedAt: new Date().toISOString(),
          directory: result.directory,
          configurations: result.configurations as unknown as Record<string, unknown>[],
        };
      }),

      // #12 GET /api/civ7/setup-catalog — host loader; error 500
      setupCatalog: oe.civ7.setupCatalog.effect(function* () {
        const config = yield* StudioConfig;
        const catalog = yield* Effect.tryPromise(() => config.loadSetupCatalog()).pipe(
          Effect.mapError((err) =>
            orpcError(500, errorMessage(err, "Civ7 setup catalog unavailable"), {
              observedAt: new Date().toISOString(),
            }),
          ),
        );
        return { ok: true as const, catalog };
      }),

      live: {
        // #4 GET /api/civ7/live/status — 200-with-embedded-{error}; allSettled
        status: oe.civ7.live.status.effect(function* () {
          const settled = yield* Effect.all(
            {
              status: Civ7TunerClient.playableStatus().pipe(Effect.either),
              appUi: Civ7TunerClient.appUiSnapshot().pipe(Effect.either),
              mapSummary: Civ7TunerClient.liveMapSummary().pipe(Effect.either),
              autoplay: Civ7TunerClient.autoplayStatus().pipe(Effect.either),
            },
            { concurrency: "unbounded" },
          );
          const playableStatus = settled.status._tag === "Right" ? settled.status.right : undefined;
          return {
            ok: Boolean(playableStatus && playableStatus.readiness !== "unavailable"),
            playable: playableStatus?.playable ?? false,
            observedAt: new Date().toISOString(),
            status: fieldOrError(settled.status, playableStatus),
            appUi: fieldOrError(settled.appUi),
            mapSummary: fieldOrError(settled.mapSummary),
            autoplay: fieldOrError(settled.autoplay),
          };
        }),

        // #5 GET /api/civ7/live/snapshot — error 400; clamps + csv parse parity
        snapshot: oe.civ7.live.snapshot.effect(function* ({ input }) {
          const fields = input.fields
            .split(",")
            .map((field) => field.trim())
            .filter(Boolean) as Parameters<Civ7TunerClient["mapGrid"]>[0]["fields"];
          const maxPlots = Math.min(512, Math.max(1, input.maxPlots));
          const grid = yield* Civ7TunerClient.mapGrid({
            bounds: { x: input.x, y: input.y, width: input.width, height: input.height },
            fields,
            maxPlots,
            ...(input.playerId === undefined ? {} : { playerId: input.playerId }),
          }).pipe(
            Effect.mapError((err) =>
              orpcError(400, errorMessage(err, "Civ7 live snapshot request failed")),
            ),
          );
          return {
            ok: true as const,
            observedAt: new Date().toISOString(),
            grid: grid as Record<string, unknown>,
          };
        }),

        // #6 GET /api/civ7/live/entities — error 400; Promise.all (any failure → 400)
        entities: oe.civ7.live.entities.effect(function* ({ input }) {
          const maxItems = Math.min(128, Math.max(1, input.maxItems));
          const playerId = input.playerId;
          const result = yield* Effect.all(
            {
              players: Civ7TunerClient.playerSummary({
                ...(playerId === undefined ? {} : { playerIds: [playerId] }),
                maxItems,
              }),
              units: Civ7TunerClient.unitSummary({
                ...(playerId === undefined ? {} : { playerId }),
                maxItems,
              }),
              cities: Civ7TunerClient.citySummary({
                ...(playerId === undefined ? {} : { playerId }),
                maxItems,
              }),
            },
            { concurrency: "unbounded" },
          ).pipe(
            Effect.mapError((err) =>
              orpcError(400, errorMessage(err, "Civ7 live entities request failed")),
            ),
          );
          return {
            ok: true as const,
            observedAt: new Date().toISOString(),
            players: result.players as Record<string, unknown>,
            units: result.units as Record<string, unknown>,
            cities: result.cities as Record<string, unknown>,
          };
        }),

        // #7 GET /api/civ7/live/gameinfo — error 400; 8-table cap, N parallel reads
        gameInfo: oe.civ7.live.gameInfo.effect(function* ({ input }) {
          const tables = input.tables
            .split(",")
            .map((table) => table.trim())
            .filter(Boolean)
            .slice(0, 8);
          const limit = Math.min(200, Math.max(1, input.limit));
          const entries = yield* Effect.all(
            tables.map((table) =>
              Civ7TunerClient.gameInfoRows(table, limit).pipe(
                Effect.map((rows) => [table, rows] as const),
              ),
            ),
            { concurrency: "unbounded" },
          ).pipe(
            Effect.mapError((err) =>
              orpcError(400, errorMessage(err, "Civ7 live GameInfo request failed")),
            ),
          );
          // Parity: each table value is the WHOLE result object (legacy behavior).
          return {
            ok: true as const,
            observedAt: new Date().toISOString(),
            tables: Object.fromEntries(entries) as unknown as Record<
              string,
              Record<string, unknown>
            >,
          };
        }),
      },
    },

    runInGame: {
      // #14 POST /api/civ7/run-in-game — host engine; 409/400/500/503
      start: oe.runInGame.start.effect(function* ({ input }) {
        const config = yield* StudioConfig;
        return yield* Effect.tryPromise({
          try: () => config.runInGameStart(input),
          catch: (err) => err,
        }).pipe(Effect.mapError(rethrowEngineError("Run in Game failed", 500)));
      }),

      // #13 GET /api/civ7/run-in-game/status — host store; 404 echoes server id
      status: oe.runInGame.status.effect(function* ({ input }) {
        const config = yield* StudioConfig;
        return yield* Effect.tryPromise({
          try: () => config.runInGameStatus(input),
          catch: (err) => err,
        }).pipe(Effect.mapError(rethrowEngineError("Run in Game status failed", 500)));
      }),
    },

    mapConfigs: {
      // #16 POST /api/map-configs — host engine; 409 mutex / 400 validation
      saveDeploy: oe.mapConfigs.saveDeploy.effect(function* ({ input }) {
        const config = yield* StudioConfig;
        return yield* Effect.tryPromise({
          try: () => config.mapConfigSaveDeploy(input),
          catch: (err) => err,
        }).pipe(Effect.mapError(rethrowEngineError("Save failed", 400)));
      }),

      // #15 GET /api/map-configs/status — host store; 404 (no server id echo)
      status: oe.mapConfigs.status.effect(function* ({ input }) {
        const config = yield* StudioConfig;
        return yield* Effect.tryPromise({
          try: () => config.mapConfigStatus(input),
          catch: (err) => err,
        }).pipe(Effect.mapError(rethrowEngineError("Save/Deploy status failed", 500)));
      }),
    },

    studio: {
      // #9 GET /api/studio/server-info — pure; no errors
      serverInfo: oe.studio.serverInfo.effect(function* () {
        const config = yield* StudioConfig;
        return {
          ok: true as const,
          serverInstanceId: config.serverInstanceId,
          startedAt: config.serverStartedAt,
          runInGameApiVersion: 2 as const,
          viteCommand: config.viteCommand,
        };
      }),
    },
  });
}

/**
 * The studio router type, contract-derived (`Router<StudioContract, …>`) rather
 * than the lossy `AnyRouter`. `RPCHandler` accepts it (`AnyRouter` is its lower
 * bound), and the handler module re-exports it.
 */
export type StudioRouter = ReturnType<typeof createStudioRouter>;

/**
 * Map a `civ7.live.status` per-field result to the contract's
 * `unknownRecord | { error }` union, matching the legacy `allSettled` body:
 * a fulfilled value passes through; a rejection becomes `{ error: String(reason) }`.
 */
function fieldOrError<A>(
  either: { _tag: "Left"; left: unknown } | { _tag: "Right"; right: A },
  override?: A,
): Record<string, unknown> | { error: string } {
  if (either._tag === "Right") return (override ?? either.right) as Record<string, unknown>;
  return { error: String(either.left) };
}

/**
 * Re-throw a host-engine error: if it is already an `ORPCError` (the engine maps
 * its 409/400/404/500/503 + `data` via ../errors) pass it through verbatim;
 * otherwise wrap in a uniform fallback status. Used in `Effect.mapError`, so it
 * returns the resolved `ORPCError` (the effect handler's error channel).
 */
function rethrowEngineError(fallbackMessage: string, fallbackStatus: number) {
  return (err: unknown): ORPCError<string, unknown> => {
    if (err instanceof ORPCError) return err;
    return orpcError(fallbackStatus, errorMessage(err, fallbackMessage));
  };
}
