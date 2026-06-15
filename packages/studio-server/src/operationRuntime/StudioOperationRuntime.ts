import { createHash } from "node:crypto";
import { Context, Effect, FiberSet, Layer, type Scope } from "effect";

import type { StudioInputs, StudioOutputs } from "../context.js";
import type { RunInGameRequestStatus } from "../contract/runInGame.js";
import type { StudioOperationsCurrent } from "../contract/studio.js";
import {
  invalidRequest,
  isStudioRuntimeFailure,
  runtimeDisposed,
  type StudioRuntimeFailure,
} from "../errors/index.js";
import type { StudioEventHubApi } from "../services/StudioEventHub.js";
import type {
  RunInGameDeployment,
  RunInGamePreparedRequest,
  RunInGameRestartResult,
  RunInGameSetupPrepared,
  SaveDeployPreparedRequest,
  RunInGameStarted,
  StudioDaemonIdentity,
  StudioOperationRuntimePorts,
} from "./ports.js";
import { operationEvent, projectCurrent } from "./projection.js";
import {
  admitRunInGame,
  admitSaveDeploy,
  ensureAdmissionOpen,
  failRunInGame,
  failSaveDeploy,
  getRunInGame,
  getSaveDeploy,
  getState,
  makeRegistry,
  markDisposed,
  transitionRunInGame,
  transitionSaveDeploy,
  type RunInGameFailurePhase,
  type RunInGameTransition,
  type SaveDeployTransition,
} from "./registry.js";
import { createStudioOperationId } from "./ids.js";
import { buildStandardRunInGameSourceSnapshotProof } from "./sourceSnapshot.js";

export interface StudioOperationRuntimeApi {
  readonly identity: StudioDaemonIdentity;
  readonly runInGameStart: (
    input: StudioInputs["runInGame"]["start"]
  ) => Effect.Effect<StudioOutputs["runInGame"]["start"], StudioRuntimeFailure>;
  readonly runInGameStatus: (
    input: StudioInputs["runInGame"]["status"]
  ) => Effect.Effect<StudioOutputs["runInGame"]["status"], StudioRuntimeFailure>;
  readonly saveDeployStart: (
    input: StudioInputs["mapConfigs"]["saveDeploy"]
  ) => Effect.Effect<StudioOutputs["mapConfigs"]["saveDeploy"], StudioRuntimeFailure>;
  readonly saveDeployStatus: (
    input: StudioInputs["mapConfigs"]["status"]
  ) => Effect.Effect<StudioOutputs["mapConfigs"]["status"], StudioRuntimeFailure>;
  readonly autoplay: (
    input: StudioInputs["civ7"]["autoplay"]
  ) => Effect.Effect<StudioOutputs["civ7"]["autoplay"], StudioRuntimeFailure>;
  readonly operationsCurrent: Effect.Effect<StudioOperationsCurrent, never>;
}

export class StudioOperationRuntime extends Context.Tag(
  "@civ7/studio-server/StudioOperationRuntime"
)<StudioOperationRuntime, StudioOperationRuntimeApi>() {}

export function makeStudioOperationRuntimeLayer(args: Readonly<{
  ports: StudioOperationRuntimePorts;
  eventHub: StudioEventHubApi;
  ttlMs?: number;
}>): Layer.Layer<StudioOperationRuntime> {
  return Layer.scoped(StudioOperationRuntime, makeStudioOperationRuntime(args));
}

function makeStudioOperationRuntime(args: Readonly<{
  ports: StudioOperationRuntimePorts;
  eventHub: StudioEventHubApi;
  ttlMs?: number;
}>): Effect.Effect<StudioOperationRuntimeApi, never, Scope.Scope> {
  return Effect.gen(function* () {
    const now = () => args.ports.clock?.now() ?? new Date();
    const nowIso = () => now().toISOString();
    const nowMs = () => now().getTime();
    let idSequence = 0;
    const nextRuntimeId = (prefix: string) =>
      createStudioOperationId({ prefix, nowMs: nowMs(), sequence: ++idSequence });
    const identity = {
      serverInstanceId: nextRuntimeId("studio-server"),
      serverStartedAt: nowIso(),
    };
    const registry = yield* makeRegistry(identity);
    const admissionGate = yield* Effect.makeSemaphore(1);
    const fibers = yield* FiberSet.make<void, never>();

    const publish = (operation: Parameters<typeof operationEvent>[0]) =>
      Effect.tryPromise({
        try: () => args.eventHub.publish(operationEvent(operation)),
        catch: (error) => error,
      }).pipe(
        Effect.catchAll((error) =>
          Effect.sync(() => {
            console.error("[studio-server] failed to publish operation event", error);
          })
        )
      );

    const publishMany = (operations: ReadonlyArray<Parameters<typeof operationEvent>[0]>) =>
      Effect.all(operations.map(publish), { discard: true });

    const dispose = markDisposed(
      registry,
      nowIso(),
      runtimeDisposed({
        message: "Studio operation runtime disposed while operation was still running.",
        diagnostics: { code: "studio-operation-runtime-disposed" },
      })
    ).pipe(Effect.flatMap(publishMany));

    const runWorker = (effect: Effect.Effect<void, never>) =>
      FiberSet.run(fibers, effect, { propagateInterruption: false }).pipe(Effect.asVoid);

    const runInGameWorker = (
      requestId: string,
      input: StudioInputs["runInGame"]["start"],
      prepared: RunInGamePreparedRequest
    ) =>
      Effect.gen(function* () {
        let phase: RunInGameFailurePhase = "materializing";
        let materialized: Awaited<ReturnType<StudioOperationRuntimePorts["materializeRunInGame"]>> = {};
        const work = Effect.gen(function* () {
          yield* transitionRun(requestId, { phase });
          materialized = yield* tryPromise(() =>
            args.ports.materializeRunInGame({ requestId, input, prepared })
          );
          if (materialized.materialization) {
            yield* transitionRun(requestId, {
              phase,
              materialization: materialized.materialization,
            });
          }

          phase = "deploying";
          yield* transitionRun(requestId, { phase, materialization: materialized.materialization });
          const deployment = yield* tryPromise(() =>
            args.ports.deployRunInGame({ requestId, prepared, materialized })
          );
          yield* transitionRun(requestId, {
            phase,
            materialization: deployment.materialization ?? materialized.materialization,
          });

          const restart = yield* maybeRestart(requestId, prepared, deployment);
          phase = "checking-civ7";
          yield* transitionRun(requestId, {
            phase,
            materialization: deployment.materialization ?? materialized.materialization,
            ...(restart.processRestart === undefined
              ? {}
              : { processRestart: restart.processRestart }),
          });
          yield* tryPromise(() =>
            args.ports.checkCiv7ForRunInGame({ requestId, prepared, deployment })
          );

          phase = "preparing-setup";
          yield* transitionRun(requestId, { phase });
          const setup = yield* tryPromise(() =>
            args.ports.prepareSetupForRunInGame({ requestId, prepared, deployment })
          );
          if (setup.reloadRequired) {
            phase = "reload-needed";
            yield* transitionRun(requestId, { phase });
          }

          phase = "starting-game";
          yield* transitionRun(requestId, { phase });
          const started = yield* tryPromise(() =>
            args.ports.startGameForRunInGame({ requestId, prepared, deployment, setup })
          );

          phase = "waiting-for-proof";
          yield* transitionRun(requestId, { phase });
          const proof = yield* tryPromise(() =>
            args.ports.waitForRunInGameProof({
              requestId,
              prepared,
              deployment,
              setup,
              started,
            })
          );
          yield* transitionRun(requestId, {
            phase: "complete",
            result: proof.result ?? { ok: true },
            materialization:
              proof.materialization ?? deployment.materialization ?? materialized.materialization,
            ...(proof.exactAuthorshipProof === undefined
              ? {}
              : { exactAuthorshipProof: proof.exactAuthorshipProof }),
          });
        });
        yield* work.pipe(
          Effect.catchAll((err) =>
            failRunInGame({
              registry,
              requestId,
              nowIso: nowIso(),
              phase,
              err,
            }).pipe(Effect.flatMap(publish))
          ),
          Effect.ensuring(
            Effect.promise(() => materialized?.cleanup?.() ?? Promise.resolve()).pipe(
              Effect.catchAll(() => Effect.void)
            )
          )
        );
      }).pipe(Effect.catchAll(() => Effect.void));

    const saveDeployWorker = (
      requestId: string,
      input: StudioInputs["mapConfigs"]["saveDeploy"]
    ) =>
      Effect.gen(function* () {
        let phase: "saving" | "deploying" = "saving";
        let prepared: SaveDeployPreparedRequest = {};
        const work = Effect.gen(function* () {
          prepared = sanitizeSaveDeployPrepared(yield* tryPromise(() =>
            args.ports.prepareSaveDeployStart({
              requestId,
              input,
            })
          ));
          yield* transitionSave(requestId, {
            phase,
            ...(prepared.path === undefined ? {} : { path: prepared.path }),
          });
          const saved = yield* tryPromise(() =>
            args.ports.saveMapConfig({ requestId, input, prepared })
          );
          phase = "deploying";
          yield* transitionSave(requestId, {
            phase,
            path: saved.path ?? prepared.path,
            saved: saved.saved ?? true,
          });
          const deployed = yield* tryPromise(() =>
            args.ports.deploySavedMapConfig({ requestId, input, prepared, saved })
          );
          yield* transitionSave(requestId, {
            phase: "complete",
            path: deployed.path ?? saved.path ?? prepared.path,
            saved: deployed.saved ?? saved.saved ?? true,
            deployed: deployed.deployed ?? true,
            deploy: deployed.deploy,
          });
        });
        yield* work.pipe(
          Effect.catchAll((err) =>
            failSaveDeploy({
              registry,
              requestId,
              nowIso: nowIso(),
              phase,
              err,
              normalize: args.ports.normalizeSaveDeployFailure,
            }).pipe(Effect.flatMap(publish))
          ),
          Effect.ensuring(
            Effect.promise(() => prepared.cleanup?.() ?? Promise.resolve()).pipe(
              Effect.catchAll(() => Effect.void)
            )
          )
        );
      }).pipe(Effect.catchAll(() => Effect.void));

    const transitionRun = (
      requestId: string,
      transition: RunInGameTransition
    ) =>
      transitionRunInGame({ registry, requestId, nowIso: nowIso(), transition }).pipe(
        Effect.flatMap(publish)
      );

    const transitionSave = (
      requestId: string,
      transition: SaveDeployTransition
    ) =>
      transitionSaveDeploy({ registry, requestId, nowIso: nowIso(), transition }).pipe(
        Effect.flatMap(publish)
      );

    const maybeRestart = (
      requestId: string,
      prepared: RunInGamePreparedRequest,
      deployment: RunInGameDeployment
    ): Effect.Effect<RunInGameRestartResult, StudioRuntimeFailure> => {
      if (!prepared.request.restartCivProcess || !args.ports.restartCivForRunInGame) {
        return Effect.succeed({});
      }
      return Effect.gen(function* () {
        yield* transitionRun(requestId, { phase: "restarting-civ" });
        return yield* tryPromise(() =>
          args.ports.restartCivForRunInGame?.({ requestId, prepared, deployment }) ??
          Promise.resolve({})
        );
      });
    };

    const api: StudioOperationRuntimeApi = {
      identity,
      runInGameStart: (input) =>
        Effect.gen(function* () {
          const requestId = nextRuntimeId("studio-run-in-game");
          const prepared = prepareRunInGameRequest(input, requestId);
          const admitted = yield* admissionGate.withPermits(1)(
            admitRunInGame({
              registry,
              nowMs: nowMs(),
              nowIso: nowIso(),
              ttlMs: args.ttlMs,
              requestId,
              prepared,
            })
          );
          if (admitted.admitted) {
            if (admitted.eventOperation) yield* publish(admitted.eventOperation);
            yield* runWorker(runInGameWorker(admitted.operation.requestId, input, prepared));
          }
          return admitted.operation;
        }),
      runInGameStatus: (input) =>
        getRunInGame({
          registry,
          requestId: input.requestId,
          nowMs: nowMs(),
          nowIso: nowIso(),
          ttlMs: args.ttlMs,
        }),
      saveDeployStart: (input) =>
        Effect.gen(function* () {
          const requestId = input.requestId ?? nextRuntimeId("studio-save-deploy");
          const admitted = yield* admissionGate.withPermits(1)(
            admitSaveDeploy({
              registry,
              nowMs: nowMs(),
              nowIso: nowIso(),
              ttlMs: args.ttlMs,
              requestId,
            })
          );
          if (admitted.admitted) {
            if (admitted.eventOperation) yield* publish(admitted.eventOperation);
            yield* runWorker(saveDeployWorker(admitted.operation.requestId, input));
          }
          return admitted.operation;
        }),
      saveDeployStatus: (input) =>
        getSaveDeploy({
          registry,
          requestId: input.requestId,
          nowMs: nowMs(),
          nowIso: nowIso(),
          ttlMs: args.ttlMs,
        }),
      autoplay: (input) =>
        admissionGate.withPermits(1)(
          Effect.gen(function* () {
            yield* ensureAdmissionOpen({
              registry,
              nowMs: nowMs(),
              nowIso: nowIso(),
              ttlMs: args.ttlMs,
            });
            return yield* tryPromise(() => args.ports.runAutoplay(input));
          })
        ),
      operationsCurrent: Effect.gen(function* () {
        const state = yield* getState(registry, nowMs(), nowIso(), args.ttlMs);
        return projectCurrent(state, nowIso());
      }),
    };

    return yield* Effect.acquireRelease(Effect.succeed(api), () => dispose);
  });
}

function tryPromise<A>(try_: () => Promise<A>): Effect.Effect<A, StudioRuntimeFailure> {
  return Effect.tryPromise({
    try: try_,
    catch: toRuntimeFailure,
  });
}

function prepareRunInGameRequest(
  input: StudioInputs["runInGame"]["start"],
  requestId: string
): RunInGamePreparedRequest {
  const selected = input.selectedConfig ?? {};
  const sourceSnapshot = buildStandardRunInGameSourceSnapshotProof({
    requestId,
    input,
  });
  const request: RunInGameRequestStatus = {
    recipeId: input.recipeId ?? "mod-swooper-maps/standard",
    ...(typeof input.seed === "number" ? { seed: input.seed } : {}),
    ...(typeof input.mapSize === "string" ? { mapSize: input.mapSize } : {}),
    ...(typeof input.playerCount === "number" ? { playerCount: input.playerCount } : {}),
    ...(typeof input.resources === "string" ? { resources: input.resources } : {}),
    ...(typeof selected.id === "string" ? { selectedConfigId: selected.id } : {}),
    ...(input.setupConfig === undefined ? {} : { setupConfig: input.setupConfig }),
    ...(typeof input.materialization?.mode === "string"
      ? { materializationMode: input.materialization.mode }
      : {}),
    ...(input.recovery?.restartCivProcess === true ? { restartCivProcess: true } : {}),
    ...(sourceSnapshot === undefined ? {} : { sourceSnapshot }),
  };
  const fingerprint = stableHash({
    recipeId: request.recipeId,
    seed: request.seed ?? null,
    mapSize: request.mapSize ?? null,
    playerCount: request.playerCount ?? null,
    resources: request.resources ?? null,
    selectedConfigId: request.selectedConfigId ?? null,
    setupConfig: request.setupConfig ?? null,
    materializationMode: request.materializationMode ?? null,
    config: input.config ?? null,
    sourceSnapshot: input.sourceSnapshot ?? null,
  });
  return {
    fingerprint,
    request: {
      ...request,
      fingerprint,
    },
  };
}

function sanitizeSaveDeployPrepared(prepared: SaveDeployPreparedRequest): SaveDeployPreparedRequest {
  return {
    ...(prepared.path === undefined ? {} : { path: prepared.path }),
    ...(prepared.cleanup === undefined ? {} : { cleanup: prepared.cleanup }),
  };
}

function stableHash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(canonicalize(value))).digest("hex");
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      out[key] = canonicalize((value as Record<string, unknown>)[key]);
    }
    return out;
  }
  return value;
}

function toRuntimeFailure(err: unknown): StudioRuntimeFailure {
  if (isStudioRuntimeFailure(err)) return err;
  return invalidRequest({
    message: err instanceof Error && err.message ? err.message : "Studio operation failed",
    diagnostics: {
      code: "studio-operation-port-failed",
      cause: err instanceof Error && err.message ? err.message : String(err),
    },
  });
}
