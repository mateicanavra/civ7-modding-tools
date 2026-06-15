import { createHash } from "node:crypto";
import { Context, Effect, FiberSet, Layer, type Scope } from "effect";

import type { StudioInputs, StudioOutputs } from "../context.js";
import type { RunInGameRequestStatus } from "../contract/runInGame.js";
import type { StudioOperationsCurrent } from "../contract/studio.js";
import {
  runtimeDisposed,
  type StudioRuntimeFailure,
} from "../errors/index.js";
import type { Civ7TunerSession } from "../services/Civ7TunerSession.js";
import type { StudioEventHubApi } from "../services/StudioEventHub.js";
import type {
  RunInGamePreparedRequest,
  StudioDaemonIdentity,
  StudioOperationRuntimePorts,
} from "./ports.js";
import {
  AutoplayWorkflow,
  type Civ7WorkflowControl,
  Civ7WorkflowControlLive,
  makeAutoplayWorkflowLayer,
  makeRunInGameWorkflowLayer,
  makeSaveDeployWorkflowLayer,
  RunInGameWorkflow,
  SaveDeployWorkflow,
} from "../workflows/index.js";
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

type StudioOperationRuntimeLayerBaseArgs = Readonly<{
  ports: StudioOperationRuntimePorts;
  eventHub: StudioEventHubApi;
  ttlMs?: number;
}>;

export function makeStudioOperationRuntimeLayer(
  args: StudioOperationRuntimeLayerBaseArgs & Readonly<{
    civ7WorkflowControl: Layer.Layer<Civ7WorkflowControl>;
  }>
): Layer.Layer<StudioOperationRuntime>;
export function makeStudioOperationRuntimeLayer(
  args: StudioOperationRuntimeLayerBaseArgs & Readonly<{
    civ7WorkflowControl?: undefined;
  }>
): Layer.Layer<StudioOperationRuntime, never, Civ7TunerSession>;
export function makeStudioOperationRuntimeLayer(args: StudioOperationRuntimeLayerBaseArgs & Readonly<{
  civ7WorkflowControl?: Layer.Layer<Civ7WorkflowControl>;
}>): Layer.Layer<StudioOperationRuntime, never, Civ7TunerSession> {
  const workflowLayer = Layer.mergeAll(
    makeRunInGameWorkflowLayer({ ports: args.ports }),
    makeSaveDeployWorkflowLayer({ ports: args.ports }),
    makeAutoplayWorkflowLayer()
  ).pipe(Layer.provide(args.civ7WorkflowControl ?? Civ7WorkflowControlLive));
  return Layer.provide(
    Layer.scoped(StudioOperationRuntime, makeStudioOperationRuntime(args)),
    workflowLayer
  );
}

function makeStudioOperationRuntime(args: Readonly<{
  ports: StudioOperationRuntimePorts;
  eventHub: StudioEventHubApi;
  ttlMs?: number;
}>): Effect.Effect<
  StudioOperationRuntimeApi,
  never,
  Scope.Scope | RunInGameWorkflow | SaveDeployWorkflow | AutoplayWorkflow
> {
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
    const runInGameWorkflow = yield* RunInGameWorkflow;
    const saveDeployWorkflow = yield* SaveDeployWorkflow;
    const autoplayWorkflow = yield* AutoplayWorkflow;

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
      runInGameWorkflow.start({
        requestId,
        input,
        prepared,
        transitions: {
          transition: (transition) => transitionRun(requestId, transition).pipe(Effect.asVoid),
          fail: ({ phase, err }) =>
            failRunInGame({
              registry,
              requestId,
              nowIso: nowIso(),
              phase,
              err,
            }).pipe(Effect.flatMap(publish), Effect.asVoid),
        },
      });

    const saveDeployWorker = (
      requestId: string,
      input: StudioInputs["mapConfigs"]["saveDeploy"]
    ) =>
      saveDeployWorkflow.start({
        requestId,
        input,
        transitions: {
          transition: (transition) => transitionSave(requestId, transition).pipe(Effect.asVoid),
          fail: ({ phase, err }) =>
            failSaveDeploy({
              registry,
              requestId,
              nowIso: nowIso(),
              phase,
              err,
            }).pipe(Effect.flatMap(publish), Effect.asVoid),
        },
      });

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
            return yield* autoplayWorkflow.run(input);
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
