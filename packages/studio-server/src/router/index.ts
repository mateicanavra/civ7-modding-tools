import type { Router } from "@orpc/server";
import { Effect } from "effect";
import { implementEffect } from "effect-orpc";

import { type StudioEffectContract, studioEffectContract } from "../contract/index.js";
import {
  mapStudioFailureToDefinedError,
  mapUnexpectedDefectToDefinedError,
  type StudioOperationProcedure,
  type StudioRuntimeFailure,
} from "../errors/index.js";
import { errorMessage } from "../errors.js";
import { readLiveGameStatusBody } from "../liveGame/statusRead.js";
import { StudioOperationRuntime } from "../operationRuntime/index.js";
import type { StudioRuntime } from "../runtime.js";
import { Civ7TunerClient } from "../services/Civ7TunerClient.js";
import { StudioConfig } from "../services/StudioConfig.js";
import { StudioEventHub, studioEventSubscriptionIterator } from "../services/StudioEventHub.js";

/**
 * effect-orpc router for `@civ7/studio-server` (slice A3).
 *
 * This is the ONLY module that imports `effect-orpc` (research/01 section 6 isolation
 * rule). Each leaf is `implementEffect(...).<ns>.<proc>.effect(function*(){...})`.
 * Procedure comments keep retired REST endpoint numbers as audit/parity IDs.
 * The current runtime surface is the TypeBox/effect-oRPC contract mounted under
 * one `/rpc` route; `/api/*` references below are not active transport routes.
 *
 *   - Read procedures call `Civ7TunerClient` (-> `@civ7/direct-control`) and map a
 *     failure to its DECLARED contract error via the typed `errors.CODE(...)`
 *     constructor param (contract/errors.ts). The codes pin the EXACT legacy
 *     status - they are NON-UNIFORM (gameInfo/live.* -> 400, setupConfig -> 503,
 *     most -> 500), the do-not-break registry (architecture/10 section 7).
 *   - `civ7.live.status` runs the four reads under `Effect.all({ mode: "either" })`
 *     (the `Promise.allSettled` analogue) and embeds `{ error }` per field at 200;
 *     only an outer defect yields a transport error. PARITY INVARIANT.
 *   - The stateful surfaces (autoplay #8, runInGame #13/#14, mapConfigs
 *     #15/#16, operations.current) use the package-owned
 *     the package operation runtime. Expected outcomes are typed
 *     `StudioRuntimeFailure`s mapped here to declared oRPC errors. Defects are
 *     contained as namespace `*_FAILED` with package-projected
 *     `UnexpectedDefectData`.
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
  runtime: StudioRuntime
): Router<StudioEffectContract, Record<never, never>> {
  const oe = implementEffect(studioEffectContract, runtime);

  return oe.router({
    civ7: {
      // #1 civ7.status - retired REST parity id; error 500
      status: oe.civ7.status.effect(function* ({ errors }) {
        const status = yield* Civ7TunerClient.playableStatus().pipe(
          Effect.mapError((err) =>
            errors.CIV7_STATUS_UNAVAILABLE({
              message: errorMessage(err, "Civ7 status request failed"),
            })
          )
        );
        return { ok: status.playable, status: status as Record<string, unknown> };
      }),

      // #2 civ7.mapSummary - retired REST parity id; error 500
      mapSummary: oe.civ7.mapSummary.effect(function* ({ errors }) {
        const summary = yield* Civ7TunerClient.mapSummary().pipe(
          Effect.mapError((err) =>
            errors.CIV7_MAP_SUMMARY_UNAVAILABLE({
              message: errorMessage(err, "Civ7 map summary request failed"),
            })
          )
        );
        return { ok: true as const, summary: summary as Record<string, unknown> };
      }),

      // #3 civ7.gameInfo - retired REST parity id; error 400 (NOT 500)
      gameInfo: oe.civ7.gameInfo.effect(function* ({ input, errors }) {
        const rows = yield* Civ7TunerClient.gameInfoRows(input.table, input.limit ?? 100).pipe(
          Effect.mapError((err) =>
            errors.CIV7_GAMEINFO_FAILED({
              message: errorMessage(err, "Civ7 GameInfo request failed"),
            })
          )
        );
        // Retired REST parity: the WHOLE result object stays under `rows`.
        return { ok: true as const, rows: rows as unknown as Record<string, unknown> };
      }),

      // #8 civ7.autoplay - package runtime command; 409 mutex / 500
      autoplay: oe.civ7.autoplay.effect(function* ({ input, errors }) {
        const operationRuntime = yield* StudioOperationRuntime;
        return yield* operationRuntime
          .autoplay(input)
          .pipe(
            Effect.mapError((failure) =>
              statefulFailure(
                errors,
                failure,
                "autoplay.command",
                "Civ7 autoplay request failed",
                operationRuntime.identity
              )
            )
          );
      }),

      // #10 civ7.setupConfig - error 503 (UNIQUE), body carries observedAt
      setupConfig: oe.civ7.setupConfig.effect(function* ({ errors }) {
        const snapshot = yield* Civ7TunerClient.setupSnapshot().pipe(
          Effect.mapError((err) =>
            errors.SETUP_CONFIG_UNAVAILABLE({
              message: errorMessage(err, "Civ7 setup config unavailable"),
              data: { observedAt: new Date().toISOString() },
            })
          )
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

      // #11 civ7.savedConfigs - error 500, body carries observedAt
      savedConfigs: oe.civ7.savedConfigs.effect(function* ({ errors }) {
        const result = yield* Civ7TunerClient.savedConfigurations().pipe(
          Effect.mapError((err) =>
            errors.SAVED_CONFIGS_UNAVAILABLE({
              message: errorMessage(err, "Civ7 saved configurations unavailable"),
              data: { observedAt: new Date().toISOString() },
            })
          )
        );
        return {
          ok: true as const,
          observedAt: new Date().toISOString(),
          directory: result.directory,
          configurations: result.configurations as unknown as Record<string, unknown>[],
        };
      }),

      // #12 civ7.setupCatalog - host loader; error 500
      setupCatalog: oe.civ7.setupCatalog.effect(function* ({ errors }) {
        const config = yield* StudioConfig;
        const catalog = yield* Effect.tryPromise({
          try: () => config.loadSetupCatalog(),
          catch: (err) =>
            errors.SETUP_CATALOG_UNAVAILABLE({
              message: errorMessage(err, "Civ7 setup catalog unavailable"),
              data: { observedAt: new Date().toISOString() },
            }),
        });
        return { ok: true as const, catalog };
      }),

      live: {
        // #4 civ7.live.status - request/response read; 200-with-embedded-{error}
        status: oe.civ7.live.status.effect(function* () {
          return yield* readLiveGameStatusBody;
        }),

        // #5 civ7.live.snapshot - error 400; clamps + csv parse parity
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
              })
            )
          );
          return {
            ok: true as const,
            observedAt: new Date().toISOString(),
            grid: grid as Record<string, unknown>,
          };
        }),

        // #6 civ7.live.entities - error 400; any failed read -> 400
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
            { concurrency: "unbounded" }
          ).pipe(
            Effect.mapError((err) =>
              errors.CIV7_LIVE_ENTITIES_FAILED({
                message: errorMessage(err, "Civ7 live entities request failed"),
              })
            )
          );
          return {
            ok: true as const,
            observedAt: new Date().toISOString(),
            players: result.players as Record<string, unknown>,
            units: result.units as Record<string, unknown>,
            cities: result.cities as Record<string, unknown>,
          };
        }),

        // #7 civ7.live.gameInfo - error 400; 8-table cap, N parallel reads
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
                Effect.map((rows) => [table, rows] as const)
              )
            ),
            { concurrency: "unbounded" }
          ).pipe(
            Effect.mapError((err) =>
              errors.CIV7_LIVE_GAMEINFO_FAILED({
                message: errorMessage(err, "Civ7 live GameInfo request failed"),
              })
            )
          );
          // Retired REST parity: each table value is the WHOLE result object.
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
      // #14 runInGame.start - package runtime operation; 409/400/500/503
      start: oe.runInGame.start.effect(function* ({ input, errors }) {
        const operationRuntime = yield* StudioOperationRuntime;
        return yield* operationRuntime
          .runInGameStart(input)
          .pipe(
            Effect.mapError((failure) =>
              statefulFailure(
                errors,
                failure,
                "runInGame.start",
                "Run in Game failed",
                operationRuntime.identity
              )
            )
          );
      }),

      // #13 runInGame.status - keyed mutation-state read; 404 echoes server id
      status: oe.runInGame.status.effect(function* ({ input, errors }) {
        const operationRuntime = yield* StudioOperationRuntime;
        return yield* operationRuntime
          .runInGameStatus(input)
          .pipe(
            Effect.mapError((failure) =>
              statefulFailure(
                errors,
                failure,
                "runInGame.status",
                "Run in Game status failed",
                operationRuntime.identity
              )
            )
          );
      }),
    },

    mapConfigs: {
      // #16 mapConfigs.saveDeploy - package runtime operation; 409 mutex / 400 validation
      saveDeploy: oe.mapConfigs.saveDeploy.effect(function* ({ input, errors }) {
        const operationRuntime = yield* StudioOperationRuntime;
        return yield* operationRuntime
          .saveDeployStart(input)
          .pipe(
            Effect.mapError((failure) =>
              statefulFailure(
                errors,
                failure,
                "saveDeploy.start",
                "Save failed",
                operationRuntime.identity
              )
            )
          );
      }),

      // #15 mapConfigs.status - keyed mutation-state read; 404 echoes server id
      status: oe.mapConfigs.status.effect(function* ({ input, errors }) {
        const operationRuntime = yield* StudioOperationRuntime;
        return yield* operationRuntime
          .saveDeployStatus(input)
          .pipe(
            Effect.mapError((failure) =>
              statefulFailure(
                errors,
                failure,
                "saveDeploy.status",
                "Save/Deploy status failed",
                operationRuntime.identity
              )
            )
          );
      }),
    },

    studio: {
      // #9 studio.serverInfo - identity read; no errors
      serverInfo: oe.studio.serverInfo.effect(function* () {
        const config = yield* StudioConfig;
        const operationRuntime = yield* StudioOperationRuntime;
        return {
          ok: true as const,
          serverInstanceId: operationRuntime.identity.serverInstanceId,
          startedAt: operationRuntime.identity.serverStartedAt,
          runInGameApiVersion: 2 as const,
          viteCommand: config.viteCommand,
        };
      }),
      events: {
        watch: oe.studio.events.watch.effect(function* () {
          const operationRuntime = yield* StudioOperationRuntime;
          const eventHub = yield* StudioEventHub;
          const subscription = yield* eventHub.subscribe({
            initialEvents: [
              {
                type: "hello",
                serverInstanceId: operationRuntime.identity.serverInstanceId,
                serverStartedAt: operationRuntime.identity.serverStartedAt,
                observedAt: new Date().toISOString(),
              },
            ],
          });
          return studioEventSubscriptionIterator(subscription);
        }),
      },
      operations: {
        current: oe.studio.operations.current.effect(function* () {
          const operationRuntime = yield* StudioOperationRuntime;
          return yield* operationRuntime.operationsCurrent;
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

function statefulDefect(
  err: unknown,
  procedure: StudioOperationProcedure,
  fallbackMessage: string
) {
  return mapUnexpectedDefectToDefinedError({
    err,
    procedure,
    fallbackMessage: errorMessage(err, fallbackMessage),
  });
}

function statefulFailure(
  errors: unknown,
  failure: StudioRuntimeFailure,
  procedure: StudioOperationProcedure,
  fallbackMessage: string,
  identity: Readonly<{ serverInstanceId: string; serverStartedAt: string }>
): any {
  const projected = mapStudioFailureToDefinedError({
    failure,
    procedure,
    identity,
  });
  const constructors = errors as Record<
    string,
    (args: { message?: string; data?: unknown }) => unknown
  >;
  const constructor = constructors[projected.code];
  if (constructor) {
    return constructor({
      message: projected.message || fallbackMessage,
      data: projected.data,
    });
  }
  const defect = statefulDefect(failure, procedure, fallbackMessage);
  return constructors[defect.code]?.({ message: defect.message, data: defect.data }) ?? defect;
}

/**
 * The studio router type, contract-derived (`Router<StudioContract, ...>`) rather
 * than the lossy `AnyRouter`. `RPCHandler` accepts it (`AnyRouter` is its lower
 * bound), and the handler module re-exports it.
 */
export type StudioRouter = ReturnType<typeof createStudioRouter>;
