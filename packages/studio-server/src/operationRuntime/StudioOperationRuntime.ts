import { createHash, randomUUID } from "node:crypto";
import type { StudioOperationsCurrent } from "@civ7/studio-contract";
import {
  type MapConfigSaveDeployStatus,
  type RunInGameRequestStatus,
  validateRunInGameSetupConfig,
} from "@civ7/studio-contract";
import { Context, Effect, Fiber, FiberSet, Layer, type Scope } from "effect";
import type { StudioInputs, StudioOutputs } from "../context.js";
import {
  dependencyUnavailable,
  invalidRequest,
  runtimeDisposed,
  type StudioRuntimeFailure,
} from "../errors/index.js";
import type { Civ7TunerSession } from "../services/Civ7TunerSession.js";
import { StudioEventHub } from "../services/StudioEventHub.js";
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
import { lookupRunDiagnostics, writeRunDiagnostics } from "./diagnostics.js";
import { createStudioOperationId } from "./ids.js";
import {
  resolveRunInGameLaunchSource,
  sourceSnapshotFromLaunchResolution,
} from "./launchSource.js";
import type { RunInGameInternalOperation, SaveDeployInternalOperation } from "./model.js";
import {
  acquireRuntimeDaemonHeartbeat,
  acquireRuntimeOwnershipLease,
  attachRuntimeOwnershipLeaseDeployment,
  isRuntimeOperationTerminal,
  operationFromAbandonedRecord,
  type RuntimeOwnershipLease,
  readAbandonedRunOperationRecords,
  releaseRuntimeOwnershipLease,
  releaseRuntimeOwnershipLeaseForRecord,
  releaseStaleRuntimeOwnershipLease,
  writeRunOperationRecord,
} from "./operationRecords.js";
import type {
  CanonicalRunInGameRequest,
  RunInGamePreparedRequest,
  StudioDaemonIdentity,
  StudioOperationRuntimePorts,
} from "./ports.js";
import { operationEvent, projectCurrent } from "./projection.js";
import {
  type Admission,
  admitRunInGame,
  admitSaveDeploy,
  adoptRunInGameOperations,
  cancelRunInGame,
  ensureAdmissionOpen,
  failRunInGameMutation,
  failSaveDeploy,
  getRunInGame,
  getSaveDeploy,
  getState,
  lookupSaveDeployAdmission,
  makeRegistry,
  markDisposed,
  markRunInGameCancellationCleanupFailure,
  markRunInGameDiagnosticsAvailable,
  type RunInGameMutation,
  type RunInGameTransition,
  type SaveDeployTransition,
  transitionRunInGameMutation,
  transitionSaveDeploy,
} from "./registry.js";
import { buildRunInGameSourceSnapshotProof } from "./sourceSnapshot.js";

export interface StudioOperationRuntimeApi {
  readonly identity: StudioDaemonIdentity;
  readonly runInGameStart: (
    input: StudioInputs["runInGame"]["start"]
  ) => Effect.Effect<StudioOutputs["runInGame"]["start"], StudioRuntimeFailure>;
  readonly runInGameStatus: (
    input: StudioInputs["runInGame"]["status"]
  ) => Effect.Effect<StudioOutputs["runInGame"]["status"], StudioRuntimeFailure>;
  readonly runInGameCancel: (
    input: StudioInputs["runInGame"]["cancel"]
  ) => Effect.Effect<StudioOutputs["runInGame"]["cancel"], StudioRuntimeFailure>;
  readonly runInGameDiagnostics: (
    input: StudioInputs["runInGame"]["diagnostics"]
  ) => Effect.Effect<StudioOutputs["runInGame"]["diagnostics"], never>;
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

type RuntimeEventOperation = RunInGameInternalOperation | SaveDeployInternalOperation;

type SaveDeployAdmissionResult =
  | Readonly<{
      kind: "existing";
      admitted: Extract<Admission<MapConfigSaveDeployStatus>, { kind: "existing" }>;
    }>
  | Readonly<{
      kind: "new";
      admitted: Admission<MapConfigSaveDeployStatus, SaveDeployInternalOperation>;
      lease: RuntimeOwnershipLease;
    }>;

type StudioOperationRuntimeLayerBaseArgs = Readonly<{
  ports: StudioOperationRuntimePorts;
  ttlMs?: number;
}>;

export function makeStudioOperationRuntimeLayer(
  args: StudioOperationRuntimeLayerBaseArgs &
    Readonly<{
      civ7WorkflowControl: Layer.Layer<Civ7WorkflowControl>;
    }>
): Layer.Layer<StudioOperationRuntime, never, StudioEventHub>;
export function makeStudioOperationRuntimeLayer(
  args: StudioOperationRuntimeLayerBaseArgs &
    Readonly<{
      civ7WorkflowControl?: undefined;
    }>
): Layer.Layer<StudioOperationRuntime, never, Civ7TunerSession | StudioEventHub>;
export function makeStudioOperationRuntimeLayer(
  args: StudioOperationRuntimeLayerBaseArgs &
    Readonly<{
      civ7WorkflowControl?: Layer.Layer<Civ7WorkflowControl>;
    }>
): Layer.Layer<StudioOperationRuntime, never, Civ7TunerSession | StudioEventHub> {
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

function makeStudioOperationRuntime(
  args: Readonly<{
    ports: StudioOperationRuntimePorts;
    ttlMs?: number;
  }>
): Effect.Effect<
  StudioOperationRuntimeApi,
  never,
  Scope.Scope | RunInGameWorkflow | SaveDeployWorkflow | AutoplayWorkflow | StudioEventHub
> {
  return Effect.gen(function* () {
    const now = () => args.ports.clock?.now() ?? new Date();
    const nowIso = () => now().toISOString();
    const nowMs = () => now().getTime();
    let idSequence = 0;
    const nextRuntimeId = (prefix: string) =>
      createStudioOperationId({ prefix, nowMs: nowMs(), sequence: ++idSequence });
    const identity = {
      serverInstanceId: `${nextRuntimeId("studio-server")}-${randomUUID()}`,
      serverStartedAt: nowIso(),
    };
    const runInGameWorkspaceRoot = args.ports.runInGameWorkspaceRoot;
    const registry = yield* makeRegistry(identity);
    const admissionGate = yield* Effect.makeSemaphore(1);
    const fibers = yield* FiberSet.make<void, never>();
    const runInGameWorkerFibers = new Map<string, Fiber.RuntimeFiber<void, never>>();
    const runInGameCleanup = new Map<string, () => Effect.Effect<void, unknown>>();
    const runInGameWorkflow = yield* RunInGameWorkflow;
    const saveDeployWorkflow = yield* SaveDeployWorkflow;
    const autoplayWorkflow = yield* AutoplayWorkflow;
    const eventHub = yield* StudioEventHub;
    yield* acquireRuntimeDaemonHeartbeat({
      workspaceRoot: runInGameWorkspaceRoot,
      identity,
    });

    const releaseTerminalLease = (operation: RuntimeEventOperation): Effect.Effect<void, never> => {
      if (!isRuntimeOperationTerminal(operation)) return Effect.void;
      return releaseRuntimeOwnershipLease({
        workspaceRoot: runInGameWorkspaceRoot,
        leaseId: operation.leaseId,
        requestId: operation.requestId,
      });
    };

    const persistedOperation = (
      operation: RuntimeEventOperation
    ): Effect.Effect<RuntimeEventOperation, never> =>
      operation.kind !== "run-in-game"
        ? releaseTerminalLease(operation).pipe(Effect.as(operation))
        : writeRunDiagnostics(operation, { workspaceRoot: runInGameWorkspaceRoot }).pipe(
            Effect.flatMap(() =>
              markRunInGameDiagnosticsAvailable(
                registry,
                operation.requestId,
                operation.operationRevision
              )
            ),
            Effect.flatMap((marked) =>
              writeRunOperationRecord(marked ?? operation, identity, {
                workspaceRoot: runInGameWorkspaceRoot,
              }).pipe(Effect.as(marked ?? operation))
            ),
            Effect.tap(releaseTerminalLease),
            Effect.catchAll((error) =>
              Effect.sync(() => {
                console.error("[studio-server] failed to persist run diagnostics", error);
                return operation;
              }).pipe(Effect.tap(releaseTerminalLease))
            )
          );

    const publish = (operation: RuntimeEventOperation): Effect.Effect<void, never> =>
      Effect.gen(function* () {
        const availableOperation = yield* persistedOperation(operation);
        yield* eventHub.publish(operationEvent(availableOperation)).pipe(
          Effect.catchAll((error) =>
            Effect.sync(() => {
              console.error("[studio-server] failed to publish operation event", error);
            })
          )
        );
      });

    const publishMany = (operations: ReadonlyArray<RuntimeEventOperation>) =>
      Effect.all(operations.map(publish), { discard: true });

    const attachRunDeploymentLeaseEvidence = (
      operation: RunInGameInternalOperation
    ): Effect.Effect<RunInGameInternalOperation, StudioRuntimeFailure> => {
      if (operation.status !== "running") {
        return Effect.succeed(operation);
      }
      if (operation.deploymentEvidence === undefined) {
        return isPostDeployRunPhase(operation.phase)
          ? Effect.fail(missingRunDeploymentEvidence(operation))
          : Effect.succeed(operation);
      }
      return attachRuntimeOwnershipLeaseDeployment({
        workspaceRoot: runInGameWorkspaceRoot,
        leaseId: operation.leaseId,
        requestId: operation.requestId,
        deployedModId: operation.deploymentEvidence.runDeployment.deployedModId,
        nowIso: operation.updatedAt,
      }).pipe(Effect.as(operation));
    };

    const dispose = markDisposed(
      registry,
      nowIso(),
      runtimeDisposed({
        message: "Studio operation runtime disposed while operation was still running.",
        diagnostics: { code: "studio-operation-runtime-disposed" },
      })
    ).pipe(Effect.flatMap(publishMany));

    yield* releaseStaleRuntimeOwnershipLease({
      workspaceRoot: runInGameWorkspaceRoot,
      identity,
    });
    const abandonedRecords = yield* readAbandonedRunOperationRecords({
      workspaceRoot: runInGameWorkspaceRoot,
      identity,
    });
    if (abandonedRecords.length > 0) {
      const abandonedOperations = abandonedRecords.map((record) =>
        operationFromAbandonedRecord(record, nowIso())
      );
      yield* Effect.all(
        abandonedRecords.map((record) =>
          releaseRuntimeOwnershipLeaseForRecord({
            workspaceRoot: runInGameWorkspaceRoot,
            record,
          })
        ),
        { discard: true }
      );
      yield* adoptRunInGameOperations(registry, abandonedOperations).pipe(
        Effect.flatMap(publishMany)
      );
    }

    const runWorker = (effect: Effect.Effect<void, never>) =>
      FiberSet.run(fibers, effect, { propagateInterruption: false }).pipe(Effect.asVoid);

    const runTrackedRunInGameWorker = (
      requestId: string,
      effect: Effect.Effect<void, never>
    ): Effect.Effect<void, never> =>
      FiberSet.run(fibers, effect, { propagateInterruption: false }).pipe(
        Effect.tap((fiber) =>
          Effect.sync(() => {
            runInGameWorkerFibers.set(requestId, fiber);
            fiber.addObserver(() => {
              if (runInGameWorkerFibers.get(requestId) === fiber) {
                runInGameWorkerFibers.delete(requestId);
              }
            });
          })
        ),
        Effect.asVoid
      );

    const publishRunMutation = (
      mutation: RunInGameMutation
    ): Effect.Effect<void, StudioRuntimeFailure> => {
      if (mutation.kind !== "changed") return Effect.void;
      if (mutation.operation.status === "cancelled") return Effect.void;
      return attachRunDeploymentLeaseEvidence(mutation.operation).pipe(
        Effect.flatMap((operation) => {
          const cleanupTerminalHandle =
            operation.status === "running"
              ? Effect.void
              : Effect.sync(() => {
                  runInGameCleanup.delete(operation.requestId);
                });
          return publish(operation).pipe(Effect.zipRight(cleanupTerminalHandle));
        })
      );
    };

    const recordRunInGameCleanupFailure = (
      requestId: string,
      operationRevision: number,
      err: unknown
    ): Effect.Effect<void, never> =>
      markRunInGameCancellationCleanupFailure({
        registry,
        requestId,
        operationRevision,
        nowIso: nowIso(),
        err,
      }).pipe(
        Effect.asVoid,
        Effect.catchAll(() =>
          Effect.sync(() => {
            console.error(
              "[studio-server] failed to record cancelled Run in Game cleanup failure",
              err
            );
          })
        )
      );

    const fallbackCleanupRunInGame = (
      requestId: string,
      operationRevision: number
    ): Effect.Effect<void, never> => {
      const cleanup = runInGameCleanup.get(requestId);
      if (cleanup === undefined) return Effect.void;
      return cleanup().pipe(
        Effect.catchAll((err) => recordRunInGameCleanupFailure(requestId, operationRevision, err))
      );
    };

    const interruptRunInGameForCancel = (
      requestId: string,
      operationRevision: number
    ): Effect.Effect<void, never> => {
      const fiber = runInGameWorkerFibers.get(requestId);
      if (fiber === undefined) return fallbackCleanupRunInGame(requestId, operationRevision);
      return Fiber.interruptFork(fiber).pipe(
        Effect.zipRight(fallbackCleanupRunInGame(requestId, operationRevision))
      );
    };

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
          registerCleanup: (cleanup) =>
            Effect.sync(() => {
              runInGameCleanup.set(requestId, cleanup);
            }),
          fail: ({ phase, err }) =>
            failRunInGameMutation({
              registry,
              requestId,
              nowIso: nowIso(),
              phase,
              err,
            }).pipe(
              Effect.flatMap(publishRunMutation),
              Effect.catchAll((publishErr) =>
                Effect.sync(() => {
                  console.error("[studio-server] failed to publish Run in Game failure", publishErr);
                })
              ),
              Effect.uninterruptible,
              Effect.asVoid
            ),
        },
      });

    const saveDeployWorker = (requestId: string, input: StudioInputs["mapConfigs"]["saveDeploy"]) =>
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
            }).pipe(Effect.flatMap(publish), Effect.uninterruptible, Effect.asVoid),
        },
      });

    const transitionRun = (requestId: string, transition: RunInGameTransition) =>
      transitionRunInGameMutation({ registry, requestId, nowIso: nowIso(), transition }).pipe(
        Effect.flatMap(publishRunMutation),
        Effect.uninterruptible
      );

    const transitionSave = (requestId: string, transition: SaveDeployTransition) =>
      transitionSaveDeploy({ registry, requestId, nowIso: nowIso(), transition }).pipe(
        Effect.flatMap(publish),
        Effect.uninterruptible
      );

    const runInGameInternalForPublish = (
      requestId: string,
      fallback: RunInGameInternalOperation
    ): Effect.Effect<RunInGameInternalOperation, never> =>
      getState(registry, nowMs(), nowIso(), args.ttlMs).pipe(
        Effect.map((state) => state.runInGame[requestId] ?? fallback)
      );

    const api: StudioOperationRuntimeApi = {
      identity,
      runInGameStart: (input) =>
        admissionGate.withPermits(1)(
          Effect.uninterruptibleMask((restore) =>
            Effect.gen(function* () {
              const requestId = nextRuntimeId("studio-run-in-game");
              yield* ensureAdmissionOpen({
                registry,
                nowMs: nowMs(),
                nowIso: nowIso(),
                ttlMs: args.ttlMs,
              });
              const prepared = yield* prepareRunInGameRequest({
                input,
                requestId,
                ports: args.ports,
              });
              const lease = yield* acquireRuntimeOwnershipLease({
                workspaceRoot: runInGameWorkspaceRoot,
                identity,
                ownerKind: "run-in-game",
                requestId,
                nowIso: nowIso(),
              });
              const admitted = yield* admitRunInGame({
                registry,
                nowMs: nowMs(),
                nowIso: nowIso(),
                ttlMs: args.ttlMs,
                requestId,
                leaseId: lease.leaseId,
                prepared,
              }).pipe(
                Effect.catchAll((err) =>
                  releaseRuntimeOwnershipLease({
                    workspaceRoot: runInGameWorkspaceRoot,
                    leaseId: lease.leaseId,
                    requestId,
                  }).pipe(Effect.flatMap(() => Effect.fail(err)))
                )
              );
              if (admitted.kind === "admitted") {
                yield* publish(admitted.eventOperation);
                const publicOperation = yield* getRunInGame({
                  registry,
                  requestId: admitted.operation.requestId,
                  nowMs: nowMs(),
                  nowIso: nowIso(),
                  ttlMs: args.ttlMs,
                });
                yield* runTrackedRunInGameWorker(
                  admitted.operation.requestId,
                  restore(runInGameWorker(admitted.operation.requestId, input, prepared))
                );
                return publicOperation;
              }
              yield* releaseRuntimeOwnershipLease({
                workspaceRoot: runInGameWorkspaceRoot,
                leaseId: lease.leaseId,
                requestId,
              });
              return admitted.operation;
            })
          )
        ),
      runInGameStatus: (input) =>
        getRunInGame({
          registry,
          requestId: input.requestId,
          nowMs: nowMs(),
          nowIso: nowIso(),
          ttlMs: args.ttlMs,
        }),
      runInGameCancel: (input) =>
        admissionGate.withPermits(1)(
          Effect.uninterruptibleMask(() =>
            Effect.gen(function* () {
              const cancellation = yield* cancelRunInGame({
                registry,
                requestId: input.requestId,
                nowMs: nowMs(),
                nowIso: nowIso(),
                ttlMs: args.ttlMs,
              });
              if (cancellation.kind === "existing") return cancellation.operation;
              yield* interruptRunInGameForCancel(
                input.requestId,
                cancellation.eventOperation.operationRevision
              );
              const cancelled = yield* runInGameInternalForPublish(
                input.requestId,
                cancellation.eventOperation
              );
              yield* publish(cancelled);
              yield* Effect.sync(() => {
                runInGameCleanup.delete(input.requestId);
              });
              return yield* getRunInGame({
                registry,
                requestId: input.requestId,
                nowMs: nowMs(),
                nowIso: nowIso(),
                ttlMs: args.ttlMs,
              });
            })
          )
        ),
      runInGameDiagnostics: (input) =>
        lookupRunDiagnostics(input.diagnosticsId, { workspaceRoot: runInGameWorkspaceRoot }),
      saveDeployStart: (input) =>
        Effect.uninterruptibleMask((restore) =>
          Effect.gen(function* () {
            const requestId = input.requestId ?? nextRuntimeId("studio-save-deploy");
            const admission = yield* admissionGate.withPermits(1)(
              Effect.gen(function* () {
                const existing = yield* lookupSaveDeployAdmission({
                  registry,
                  nowMs: nowMs(),
                  nowIso: nowIso(),
                  ttlMs: args.ttlMs,
                  requestId,
                });
                if (existing) return { kind: "existing", admitted: existing } as const;
                yield* ensureAdmissionOpen({
                  registry,
                  nowMs: nowMs(),
                  nowIso: nowIso(),
                  ttlMs: args.ttlMs,
                });
                const lease = yield* acquireRuntimeOwnershipLease({
                  workspaceRoot: runInGameWorkspaceRoot,
                  identity,
                  ownerKind: "save-deploy",
                  requestId,
                  nowIso: nowIso(),
                });
                const admitted = yield* admitSaveDeploy({
                  registry,
                  nowMs: nowMs(),
                  nowIso: nowIso(),
                  ttlMs: args.ttlMs,
                  requestId,
                  leaseId: lease.leaseId,
                }).pipe(
                  Effect.catchAll((err) =>
                    releaseRuntimeOwnershipLease({
                      workspaceRoot: runInGameWorkspaceRoot,
                      leaseId: lease.leaseId,
                      requestId,
                    }).pipe(Effect.flatMap(() => Effect.fail(err)))
                  )
                );
                return { kind: "new", admitted, lease } as const;
              })
            );
            const admitted = admission.admitted;
            if (admitted.kind === "admitted") {
              yield* publish(admitted.eventOperation);
              yield* runWorker(restore(saveDeployWorker(admitted.operation.requestId, input)));
            } else if (admission.kind === "new") {
              yield* releaseRuntimeOwnershipLease({
                workspaceRoot: runInGameWorkspaceRoot,
                leaseId: admission.lease.leaseId,
                requestId,
              });
            }
            return admitted.operation;
          })
        ),
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

function isPostDeployRunPhase(phase: RunInGameInternalOperation["phase"]): boolean {
  return (
    phase === "restarting-civ" ||
    phase === "checking-civ7" ||
    phase === "reload-needed" ||
    phase === "preparing-setup" ||
    phase === "starting-game" ||
    phase === "waiting-for-proof"
  );
}

function missingRunDeploymentEvidence(
  operation: RunInGameInternalOperation
): StudioRuntimeFailure {
  return dependencyUnavailable({
    message: "Run in Game reached a post-deploy runtime phase without deployment evidence.",
    dependency: "runtime",
    diagnostics: {
      code: "run-in-game-deployment-evidence-missing",
      failedAtPhase: operation.phase,
      requestId: operation.requestId,
      leaseId: operation.leaseId,
    },
    recoveryActions: ["copy-diagnostics", "retry-run"],
  });
}

function prepareRunInGameRequest(
  args: Readonly<{
    input: StudioInputs["runInGame"]["start"];
    requestId: string;
    ports: StudioOperationRuntimePorts;
  }>
): Effect.Effect<RunInGamePreparedRequest, StudioRuntimeFailure> {
  const { input, requestId, ports } = args;
  const rawControlField = findRawControlField(input);
  if (rawControlField !== undefined) {
    return Effect.fail(
      invalidRequest({
        message: "Run in Game request must not include raw control commands.",
        diagnostics: {
          code: "run-in-game-raw-control-rejected",
          field: rawControlField,
        },
      })
    );
  }
  const seed = parseSeed(input.recipeSettings.seed);
  if (!seed.ok) {
    return Effect.fail(
      invalidRequest({
        message: formatSeedError(seed),
        diagnostics: { code: "run-in-game-seed-invalid" },
      })
    );
  }
  const mapSize =
    typeof input.worldSettings.mapSize === "string"
      ? input.worldSettings.mapSize
      : "MAPSIZE_STANDARD";
  if (!/^MAPSIZE_[A-Z0-9_]+$/.test(mapSize)) {
    return Effect.fail(
      invalidRequest({
        message: "Run in Game mapSize must be a Civ7 MAPSIZE_* value",
        diagnostics: { code: "run-in-game-map-size-invalid" },
      })
    );
  }
  const playerCount =
    input.worldSettings.playerCount === undefined
      ? undefined
      : Number(input.worldSettings.playerCount);
  if (
    playerCount !== undefined &&
    (!Number.isInteger(playerCount) || playerCount < 1 || playerCount > 64)
  ) {
    return Effect.fail(
      invalidRequest({
        message: "Run in Game playerCount must be an integer between 1 and 64",
        diagnostics: { code: "run-in-game-player-count-invalid" },
      })
    );
  }
  if (input.recipeSettings.recipe !== "mod-swooper-maps/standard") {
    return Effect.fail(
      invalidRequest({
        message: "Run in Game currently supports only mod-swooper-maps/standard",
        diagnostics: { code: "run-in-game-recipe-invalid" },
      })
    );
  }
  const setupConfig = validateRunInGameSetupConfig(input.setupConfig);
  if (!setupConfig.ok) {
    return Effect.fail(
      invalidRequest({
        message: setupConfig.message,
        diagnostics: setupConfig.diagnostics,
      })
    );
  }
  return resolveRunInGameLaunchSource({
    input: {
      source: input.source,
      recipeSettings: {
        ...input.recipeSettings,
        seed: seed.value,
      },
      worldSettings: {
        mapSize,
        ...(playerCount === undefined ? {} : { playerCount }),
        ...(typeof input.worldSettings.resources === "string"
          ? { resources: input.worldSettings.resources }
          : {}),
      },
      setupConfig: setupConfig.value,
    },
    ports,
  }).pipe(
    Effect.map((resolution) => {
      const sourceSnapshot = buildRunInGameSourceSnapshotProof({
        requestId,
        sourceSnapshot: sourceSnapshotFromLaunchResolution(resolution),
        configHash: resolution.launchSourceDigest.configContentDigest,
        envelopeHash: resolution.launchEnvelopeDigest,
      });
      const request: CanonicalRunInGameRequest = {
        recipeId: input.recipeSettings.recipe,
        seed: seed.value,
        mapSize,
        ...(playerCount === undefined ? {} : { playerCount }),
        ...(typeof input.worldSettings.resources === "string"
          ? { resources: input.worldSettings.resources }
          : {}),
        selectedConfigId: resolution.selectedConfigId,
        setupConfig: setupConfig.value,
        materializationMode: resolution.materializationMode,
        ...(input.recovery?.restartCivProcess === true ? { restartCivProcess: true } : {}),
        ...(sourceSnapshot === undefined ? {} : { sourceSnapshot }),
        resolvedLaunchSource: resolution.resolvedLaunchSource,
        launchEnvelope: resolution.launchEnvelope,
        launchSourceDigest: resolution.launchSourceDigest,
        launchEnvelopeDigest: resolution.launchEnvelopeDigest,
      };
      const correlationDigest = stableHash({
        recipeId: request.recipeId,
        seed: request.seed ?? null,
        mapSize: request.mapSize ?? null,
        playerCount: request.playerCount ?? null,
        resources: request.resources ?? null,
        selectedConfigId: request.selectedConfigId ?? null,
        setupConfig: request.setupConfig ?? null,
        materializationMode: request.materializationMode ?? null,
        resolvedLaunchSource: resolution.resolvedLaunchSource,
        launchEnvelope: resolution.launchEnvelope,
        launchSourceDigest: resolution.launchSourceDigest,
      });
      return {
        correlationDigest,
        request: {
          ...request,
          fingerprint: correlationDigest,
        },
        resolvedLaunchSource: resolution.resolvedLaunchSource,
        launchEnvelope: resolution.launchEnvelope,
        launchSourceDigest: resolution.launchSourceDigest,
        launchEnvelopeDigest: resolution.launchEnvelopeDigest,
      };
    })
  );
}

const RUN_IN_GAME_SEED_MIN = 0;
const RUN_IN_GAME_SEED_MAX = 0x7fff_ffff;
const RAW_CONTROL_FIELD_PATTERN =
  /^(?:args|command|context|operationType|script|javascript|rawJs|rawCommand|session|stateName)$/i;

type SeedParseResult =
  | Readonly<{ ok: true; value: number }>
  | Readonly<{ ok: false; reason: "empty" | "not-integer" | "out-of-range" }>;

function parseSeed(value: unknown): SeedParseResult {
  const normalized = typeof value === "string" ? value.trim() : value;
  if (normalized === "" || normalized === undefined) return { ok: false, reason: "empty" };
  const seed = typeof normalized === "number" ? normalized : Number(normalized);
  if (!Number.isInteger(seed)) return { ok: false, reason: "not-integer" };
  if (seed < RUN_IN_GAME_SEED_MIN || seed > RUN_IN_GAME_SEED_MAX) {
    return { ok: false, reason: "out-of-range" };
  }
  return { ok: true, value: seed };
}

function formatSeedError(seed: SeedParseResult): string {
  if (seed.ok) return "";
  if (seed.reason === "empty") {
    return `Run in Game seed is required (${RUN_IN_GAME_SEED_MIN} to ${RUN_IN_GAME_SEED_MAX}).`;
  }
  if (seed.reason === "not-integer") {
    return `Run in Game seed must be an integer from ${RUN_IN_GAME_SEED_MIN} to ${RUN_IN_GAME_SEED_MAX}.`;
  }
  return `Run in Game seed must be between ${RUN_IN_GAME_SEED_MIN} and ${RUN_IN_GAME_SEED_MAX}; Civ7 stores setup seeds as signed 32-bit integers.`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function findRawControlField(value: unknown): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  const stack: unknown[] = [value];
  while (stack.length) {
    const next = stack.pop();
    if (!next || typeof next !== "object") continue;
    const entries = Array.isArray(next)
      ? next.map((child, index) => [String(index), child] as const)
      : Object.entries(next);
    for (const [key, child] of entries) {
      if (RAW_CONTROL_FIELD_PATTERN.test(key)) return key;
      if (child && typeof child === "object") stack.push(child);
    }
  }
  return undefined;
}

function stableHash(value: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify(canonicalize(value)))
    .digest("hex");
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
