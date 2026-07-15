import { type Civ7PlotSnapshotField, Civ7PlotSnapshotFieldSchema } from "@civ7/direct-control";
import { type StudioEffectContract, studioEffectContract } from "@civ7/studio-contract";
import { ORPCError, type Router } from "@orpc/server";
import { Effect, Match, Option } from "effect";
import { implementEffect } from "effect-orpc";
import { Value } from "typebox/value";
import {
  mapStudioFailureToDefinedError,
  mapUnexpectedDefectToDefinedError,
  type StudioDeclaredErrorCode,
  type StudioOperationProcedure,
  type StudioRuntimeFailure,
} from "../errors/index.js";
import { errorMessage } from "../errors.js";
import { readLiveGameStatusBody } from "../liveGame/statusRead.js";
import { StudioOperationRuntime } from "../operationRuntime/index.js";
import type { StudioRouterRuntime } from "../runtime.js";
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
 *     constructor param (packages/studio-contract/src/errors.ts). The codes pin the EXACT legacy
 *     status - they are NON-UNIFORM (gameInfo/live.* -> 400, setupConfig -> 503,
 *     most -> 500), the do-not-break registry (architecture/10 section 7).
 *   - `civ7.live.status` projects every field from one coherent playable-status
 *     observation. A failed observation embeds the same `{ error }` evidence in
 *     every field at 200; only an outer defect yields a transport error.
 *   - Stateful surfaces (autoplay #8, runInGame #13/#14 plus cancel,
 *     mapConfigs #15/#16, operations.current) route through the package
 *     operation runtime, which owns admission, lifecycle, diagnostics,
 *     worker supervision, events, and lease release. Expected outcomes are
 *     typed `StudioRuntimeFailure`s mapped here to declared oRPC errors.
 *     Run in Game failures use safe public category data; other stateful
 *     defects are contained as namespace `*_FAILED` with package-projected
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
  runtime: StudioRouterRuntime
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
          const fieldTokens = (input.fields ?? "terrain,biome,feature,resource,visibility,owner")
            .split(",")
            .map((field) => field.trim())
            .filter(Boolean);
          const fields = yield* Effect.forEach(fieldTokens, (field) =>
            Effect.succeed(field).pipe(
              Effect.filterOrFail(isCiv7PlotSnapshotField, () =>
                errors.CIV7_LIVE_SNAPSHOT_FAILED({
                  message: `Unsupported Civ7 plot field: ${field}`,
                })
              )
            )
          );
          const maxPlots = Math.min(512, Math.max(1, input.maxPlots ?? 512));
          const player = Option.fromNullable(input.playerId).pipe(
            Option.match({
              onNone: () => ({}),
              onSome: (playerId) => ({ playerId }),
            })
          );
          const grid = yield* Civ7TunerClient.mapGrid({
            bounds: {
              x: input.x ?? 0,
              y: input.y ?? 0,
              width: input.width ?? 24,
              height: input.height ?? 18,
            },
            fields,
            maxPlots,
            ...player,
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
          const player = Option.fromNullable(input.playerId);
          const playerSummaryInput = player.pipe(
            Option.match({
              onNone: () => ({}),
              onSome: (playerId) => ({ playerIds: [playerId] }),
            })
          );
          const entitySummaryInput = player.pipe(
            Option.match({
              onNone: () => ({}),
              onSome: (playerId) => ({ playerId }),
            })
          );
          const result = yield* Effect.all(
            {
              players: Civ7TunerClient.playerSummary({
                ...playerSummaryInput,
                maxItems,
              }),
              units: Civ7TunerClient.unitSummary({
                ...entitySummaryInput,
                maxItems,
              }),
              cities: Civ7TunerClient.citySummary({
                ...entitySummaryInput,
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

      // #13 runInGame.status - keyed public operation-state read
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

      cancel: oe.runInGame.cancel.effect(function* ({ input, errors }) {
        const operationRuntime = yield* StudioOperationRuntime;
        return yield* operationRuntime
          .runInGameCancel(input)
          .pipe(
            Effect.mapError((failure) =>
              statefulFailure(
                errors,
                failure,
                "runInGame.cancel",
                "Run in Game cancellation failed",
                operationRuntime.identity
              )
            )
          );
      }),

      diagnostics: oe.runInGame.diagnostics.effect(function* ({ input }) {
        const operationRuntime = yield* StudioOperationRuntime;
        return yield* operationRuntime.runInGameDiagnostics(input);
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
          catch: (err) =>
            Match.value(err).pipe(
              Match.when(isRecipeDagNotFound, () =>
                errors.RECIPE_DAG_RECIPE_NOT_FOUND({
                  data: {
                    procedureKey: "recipeDag.get",
                    recipeId: input.recipeId,
                  },
                })
              ),
              Match.when(isRecipeDagUnavailable, () =>
                errors.RECIPE_DAG_UNAVAILABLE({
                  data: {
                    procedureKey: "recipeDag.get",
                    recipeId: input.recipeId,
                    source: "recipe-dag-service",
                  },
                })
              ),
              Match.orElse(rethrow)
            ),
        });
      }),
    },
  });
}

const isCiv7PlotSnapshotField = (value: string): value is Civ7PlotSnapshotField =>
  Value.Check(Civ7PlotSnapshotFieldSchema, value);

const isRecipeDagNotFound = (error: unknown): error is Error =>
  error instanceof Error && error.name === "RecipeDagNotFound";

const isRecipeDagUnavailable = (error: unknown): error is Error =>
  error instanceof Error && error.name === "RecipeDagUnavailable";

function rethrow(error: unknown): never {
  throw error;
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
): ORPCError<string, unknown> {
  const projected = mapStudioFailureToDefinedError({
    failure,
    procedure,
    identity,
  });
  return Option.fromNullable(studioDefinedErrorConstructor(errors, projected.code)).pipe(
    Option.match({
      onSome: (constructor) =>
        constructor({
          message: projected.message || fallbackMessage,
          data: projected.data,
        }),
      onNone: () => statefulFallbackError(errors, failure, procedure, fallbackMessage),
    })
  );
}

function statefulFallbackError(
  errors: unknown,
  failure: StudioRuntimeFailure,
  procedure: StudioOperationProcedure,
  fallbackMessage: string
): ORPCError<string, unknown> {
  const defect = statefulDefect(failure, procedure, fallbackMessage);
  const data = Match.value(defect.data).pipe(
    Match.when(undefined, () => ({})),
    Match.orElse((definedData) => ({ data: definedData }))
  );
  return (
    studioDefinedErrorConstructor(
      errors,
      defect.code
    )?.({
      message: defect.message,
      data: defect.data,
    }) ??
    new ORPCError(defect.code, {
      status: defect.status,
      message: defect.message,
      ...data,
    })
  );
}

type StudioDefinedErrorConstructor = (args: {
  message?: string;
  data?: unknown;
}) => ORPCError<string, unknown>;

function studioDefinedErrorConstructor(
  errors: unknown,
  code: StudioDeclaredErrorCode
): StudioDefinedErrorConstructor | undefined {
  return Option.fromNullable(errors).pipe(
    Option.filter(isRecord),
    Option.flatMap((definedErrors) => Option.fromNullable(definedErrors[code])),
    Option.filter(isStudioDefinedErrorConstructor),
    Option.getOrUndefined
  );
}

function isStudioDefinedErrorConstructor(value: unknown): value is StudioDefinedErrorConstructor {
  return typeof value === "function";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/**
 * The studio router type, contract-derived (`Router<StudioContract, ...>`) rather
 * than the lossy `AnyRouter`. `RPCHandler` accepts it (`AnyRouter` is its lower
 * bound), and the handler module re-exports it.
 */
export type StudioRouter = ReturnType<typeof createStudioRouter>;
