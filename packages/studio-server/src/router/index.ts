import type { Router } from "@orpc/server";
import { ORPCError } from "@orpc/server";
import { Effect } from "effect";
import { implementEffect } from "effect-orpc";

import { studioEffectContract, type StudioEffectContract } from "../contract/index.js";
import { errorMessage } from "../errors.js";
import { readLiveGameStatusBody } from "../liveGame/statusRead.js";
import type { StudioRuntime } from "../runtime.js";
import { Civ7TunerClient } from "../services/Civ7TunerClient.js";
import { StudioConfig } from "../services/StudioConfig.js";
import { StudioEventHub } from "../services/StudioEventHub.js";

/**
 * effect-orpc router for `@civ7/studio-server` (slice A3).
 *
 * This is the ONLY module that imports `effect-orpc` (research/01 section 6 isolation
 * rule). Each leaf is `implementEffect(...).<ns>.<proc>.effect(function*(){...})`.
 * The procedure bodies lift the corresponding `/api/*` handler logic from
 * `apps/mapgen-studio/vite.config.ts` verbatim:
 *
 *   - Read procedures call `Civ7TunerClient` (-> `@civ7/direct-control`) and map a
 *     failure to its DECLARED contract error via the typed `errors.CODE(...)`
 *     constructor param (contract/errors.ts). The codes pin the EXACT legacy
 *     status - they are NON-UNIFORM (gameInfo/live.* -> 400, setupConfig -> 503,
 *     most -> 500), the do-not-break registry (architecture/10 section 7).
 *   - `civ7.live.status` runs the four reads under `Effect.all({ mode: "either" })`
 *     (the `Promise.allSettled` analogue) and embeds `{ error }` per field at 200;
 *     only an outer defect yields a transport error. PARITY INVARIANT.
 *   - The three stateful engines (autoplay #8, runInGame #13/#14, mapConfigs
 *     #15/#16) delegate to the host-injected `StudioConfig` fns (shared queue +
 *     dual-store mutex live host-side; see ../context.ts). The host throws raw
 *     `ORPCError`s whose code/status/data MATCH the declared contract entries, so
 *     re-throwing them unchanged still yields DEFINED errors client-side; any
 *     non-ORPCError throw falls back to the namespace `*_FAILED` code.
 *
 * Query parsing parity (clamps, csv split/trim/filter, playerId omit) that the
 * legacy handlers did from the URL is reproduced here against the typed input.
 */
// Return type is the CONTRACT-DERIVED `Router<StudioContract, ...>` rather than the
// lossy `AnyRouter`: the effect-orpc `oe.router(...)` result is pinned to
// `StudioContract`, and its initial context is fully provided by the injected
// `ManagedRuntime` (so `Record<never, never>`). Annotating it portably (instead of
// inferring `EnhancedRouter<...>`, which would reference effect-orpc internals and
// trip TS2742 in the emitted `.d.ts`) keeps `StudioRouter` contract-typed.
export function createStudioRouter(
  runtime: StudioRuntime,
): Router<StudioEffectContract, Record<never, never>> {
  const oe = implementEffect(studioEffectContract, runtime);

  return oe.router({
    civ7: {
      // #1 GET /api/civ7/status - error 500
      status: oe.civ7.status.effect(function* ({ errors }) {
        const status = yield* Civ7TunerClient.playableStatus().pipe(
          Effect.mapError((err) =>
            errors.CIV7_STATUS_UNAVAILABLE({
              message: errorMessage(err, "Civ7 status request failed"),
            }),
          ),
        );
        return { ok: status.playable, status: status as Record<string, unknown> };
      }),

      // #2 GET /api/civ7/map-summary - error 500
      mapSummary: oe.civ7.mapSummary.effect(function* ({ errors }) {
        const summary = yield* Civ7TunerClient.mapSummary().pipe(
          Effect.mapError((err) =>
            errors.CIV7_MAP_SUMMARY_UNAVAILABLE({
              message: errorMessage(err, "Civ7 map summary request failed"),
            }),
          ),
        );
        return { ok: true as const, summary: summary as Record<string, unknown> };
      }),

      // #3 GET /api/civ7/gameinfo?table=&limit= - error 400 (NOT 500)
      gameInfo: oe.civ7.gameInfo.effect(function* ({ input, errors }) {
        const rows = yield* Civ7TunerClient.gameInfoRows(input.table, input.limit ?? 100).pipe(
          Effect.mapError((err) =>
            errors.CIV7_GAMEINFO_FAILED({
              message: errorMessage(err, "Civ7 GameInfo request failed"),
            }),
          ),
        );
        // Parity: legacy `/api` writes the WHOLE result object under `rows`.
        return { ok: true as const, rows: rows as unknown as Record<string, unknown> };
      }),

      // #8 POST /api/civ7/autoplay - host engine; 409 mutex / 500
      autoplay: oe.civ7.autoplay.effect(function* ({ input, errors }) {
        const config = yield* StudioConfig;
        return yield* Effect.tryPromise({
          try: () => config.autoplay(input),
          catch: (err) => err,
        }).pipe(
          Effect.mapError((err) =>
            err instanceof ORPCError
              ? err
              : errors.AUTOPLAY_FAILED({
                  message: errorMessage(err, "Civ7 autoplay request failed"),
                }),
          ),
        );
      }),

      // #10 GET /api/civ7/setup-config - error 503 (UNIQUE), body carries observedAt
      setupConfig: oe.civ7.setupConfig.effect(function* ({ errors }) {
        const snapshot = yield* Civ7TunerClient.setupSnapshot().pipe(
          Effect.mapError((err) =>
            errors.SETUP_CONFIG_UNAVAILABLE({
              message: errorMessage(err, "Civ7 setup config unavailable"),
              data: { observedAt: new Date().toISOString() },
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

      // #11 GET /api/civ7/saved-configs - error 500, body carries observedAt
      savedConfigs: oe.civ7.savedConfigs.effect(function* ({ errors }) {
        const result = yield* Civ7TunerClient.savedConfigurations().pipe(
          Effect.mapError((err) =>
            errors.SAVED_CONFIGS_UNAVAILABLE({
              message: errorMessage(err, "Civ7 saved configurations unavailable"),
              data: { observedAt: new Date().toISOString() },
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

      // #12 GET /api/civ7/setup-catalog - host loader; error 500
      setupCatalog: oe.civ7.setupCatalog.effect(function* ({ errors }) {
        const config = yield* StudioConfig;
        const catalog = yield* Effect.tryPromise(() => config.loadSetupCatalog()).pipe(
          Effect.mapError((err) =>
            errors.SETUP_CATALOG_UNAVAILABLE({
              message: errorMessage(err, "Civ7 setup catalog unavailable"),
              data: { observedAt: new Date().toISOString() },
            }),
          ),
        );
        return { ok: true as const, catalog };
      }),

      live: {
        // #4 GET /api/civ7/live/status - 200-with-embedded-{error}; allSettled
        status: oe.civ7.live.status.effect(function* () {
          return yield* readLiveGameStatusBody;
        }),

        // #5 GET /api/civ7/live/snapshot - error 400; clamps + csv parse parity
        snapshot: oe.civ7.live.snapshot.effect(function* ({ input, errors }) {
          const fields = (input.fields ?? "terrain,biome,feature,resource,visibility,owner")
            .split(",")
            .map((field) => field.trim())
            .filter(Boolean) as Parameters<Civ7TunerClient["mapGrid"]>[0]["fields"];
          const maxPlots = Math.min(512, Math.max(1, input.maxPlots ?? 512));
          const grid = yield* Civ7TunerClient.mapGrid({
            bounds: {
              x: input.x ?? 0,
              y: input.y ?? 0,
              width: input.width ?? 24,
              height: input.height ?? 18,
            },
            fields,
            maxPlots,
            ...(input.playerId === undefined ? {} : { playerId: input.playerId }),
          }).pipe(
            Effect.mapError((err) =>
              errors.CIV7_LIVE_SNAPSHOT_FAILED({
                message: errorMessage(err, "Civ7 live snapshot request failed"),
              }),
            ),
          );
          return {
            ok: true as const,
            observedAt: new Date().toISOString(),
            grid: grid as Record<string, unknown>,
          };
        }),

        // #6 GET /api/civ7/live/entities - error 400; Promise.all (any failure -> 400)
        entities: oe.civ7.live.entities.effect(function* ({ input, errors }) {
          const maxItems = Math.min(128, Math.max(1, input.maxItems ?? 128));
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
              errors.CIV7_LIVE_ENTITIES_FAILED({
                message: errorMessage(err, "Civ7 live entities request failed"),
              }),
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

        // #7 GET /api/civ7/live/gameinfo - error 400; 8-table cap, N parallel reads
        gameInfo: oe.civ7.live.gameInfo.effect(function* ({ input, errors }) {
          const tables = (input.tables ?? "Terrains,Biomes,Features,Resources,Maps,MapSizes")
            .split(",")
            .map((table) => table.trim())
            .filter(Boolean)
            .slice(0, 8);
          const limit = Math.min(200, Math.max(1, input.limit ?? 100));
          const entries = yield* Effect.all(
            tables.map((table) =>
              Civ7TunerClient.gameInfoRows(table, limit).pipe(
                Effect.map((rows) => [table, rows] as const),
              ),
            ),
            { concurrency: "unbounded" },
          ).pipe(
            Effect.mapError((err) =>
              errors.CIV7_LIVE_GAMEINFO_FAILED({
                message: errorMessage(err, "Civ7 live GameInfo request failed"),
              }),
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
      // #14 POST /api/civ7/run-in-game - host engine; 409/400/500/503
      start: oe.runInGame.start.effect(function* ({ input, errors }) {
        const config = yield* StudioConfig;
        return yield* Effect.tryPromise({
          try: () => config.runInGameStart(input),
          catch: (err) => err,
        }).pipe(
          Effect.mapError((err) =>
            err instanceof ORPCError
              ? err
              : errors.RUN_IN_GAME_FAILED({ message: errorMessage(err, "Run in Game failed") }),
          ),
        );
      }),

      // #13 GET /api/civ7/run-in-game/status - host store; 404 echoes server id
      status: oe.runInGame.status.effect(function* ({ input, errors }) {
        const config = yield* StudioConfig;
        return yield* Effect.tryPromise({
          try: () => config.runInGameStatus(input),
          catch: (err) => err,
        }).pipe(
          Effect.mapError((err) =>
            err instanceof ORPCError
              ? err
              : errors.RUN_IN_GAME_FAILED({
                  message: errorMessage(err, "Run in Game status failed"),
                }),
          ),
        );
      }),
    },

    mapConfigs: {
      // #16 POST /api/map-configs - host engine; 409 mutex / 400 validation
      saveDeploy: oe.mapConfigs.saveDeploy.effect(function* ({ input, errors }) {
        const config = yield* StudioConfig;
        return yield* Effect.tryPromise({
          try: () => config.mapConfigSaveDeploy(input),
          catch: (err) => err,
        }).pipe(
          Effect.mapError((err) =>
            err instanceof ORPCError
              ? err
              : errors.SAVE_DEPLOY_FAILED({ message: errorMessage(err, "Save failed") }),
          ),
        );
      }),

      // #15 GET /api/map-configs/status - host store; 404 echoes server id
      status: oe.mapConfigs.status.effect(function* ({ input, errors }) {
        const config = yield* StudioConfig;
        return yield* Effect.tryPromise({
          try: () => config.mapConfigStatus(input),
          catch: (err) => err,
        }).pipe(
          Effect.mapError((err) =>
            err instanceof ORPCError
              ? err
              : errors.SAVE_DEPLOY_FAILED({
                  message: errorMessage(err, "Save/Deploy status failed"),
                }),
          ),
        );
      }),
    },

    studio: {
      // #9 GET /api/studio/server-info - pure; no errors
      serverInfo: oe.studio.serverInfo.effect(function* () {
        const config = yield* StudioConfig;
        return {
          ok: true as const,
          serverInstanceId: config.serverInstanceId,
          startedAt: config.serverStartedAt,
          runInGameApiVersion: 2 as const,
          hostCommand: config.hostCommand,
        };
      }),
      events: {
        watch: oe.studio.events.watch.effect(function* () {
          const config = yield* StudioConfig;
          const eventHub = yield* StudioEventHub;
          const observedAt = new Date().toISOString();
          const latestLiveGame = eventHub.latestLiveGameEvent();
          return eventHub.subscribe({
            initialEvents: [
              {
                type: "hello",
                serverInstanceId: config.serverInstanceId,
                serverStartedAt: config.serverStartedAt,
                observedAt,
              },
              ...(latestLiveGame ? [latestLiveGame] : []),
            ],
          });
        }),
      },
      operations: {
        current: oe.studio.operations.current.effect(function* () {
          const config = yield* StudioConfig;
          return yield* Effect.promise(() => config.operationsCurrent());
        }),
      },
    },

    recipeDag: {
      // Recipe-DAG projection (runtime-one-mount slice; formerly the
      // `/api/recipe-dag/rpc` satellite mount). The service is host-injected
      // through the StudioConfig layer - the ONE runtime serves this
      // namespace too; the former private empty ManagedRuntime is gone.
      get: oe.recipeDag.get.effect(function* ({ input, errors }) {
        const config = yield* StudioConfig;
        return yield* Effect.tryPromise({
          try: () => config.recipeDagService.getRecipeDag(input.recipeId),
          catch: (err) => {
            if (err instanceof Error && err.name === "RecipeDagNotFound") {
              return errors.RECIPE_DAG_RECIPE_NOT_FOUND({
                data: {
                  procedureKey: "recipeDag.get",
                  recipeId: input.recipeId,
                },
              });
            }
            return errors.RECIPE_DAG_UNAVAILABLE({
              data: {
                procedureKey: "recipeDag.get",
                recipeId: input.recipeId,
                source: "recipe-dag-service",
              },
            });
          },
        });
      }),
    },
  });
}

/**
 * The studio router type, contract-derived (`Router<StudioContract, ...>`) rather
 * than the lossy `AnyRouter`. `RPCHandler` accepts it (`AnyRouter` is its lower
 * bound), and the handler module re-exports it.
 */
export type StudioRouter = ReturnType<typeof createStudioRouter>;
