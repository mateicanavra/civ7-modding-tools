import { createHash } from "node:crypto";
import type { StudioOperationsCurrent } from "@civ7/studio-contract";
import { type RunInGameRequestStatus, validateRunInGameSetupConfig } from "@civ7/studio-contract";
import { Context, Effect, FiberSet, Layer, type Scope } from "effect";
import type { StudioInputs, StudioOutputs } from "../context.js";
import { invalidRequest, runtimeDisposed, type StudioRuntimeFailure } from "../errors/index.js";
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
import type { RunInGameInternalOperation, SaveDeployInternalOperation } from "./model.js";
import type {
  RunInGamePreparedRequest,
  StudioDaemonIdentity,
  StudioOperationRuntimePorts,
} from "./ports.js";
import { operationEvent, projectCurrent } from "./projection.js";
import {
  admitRunInGame,
  admitSaveDeploy,
  ensureAdmissionOpen,
  ensureRuntimeOpen,
  failRunInGame,
  failSaveDeploy,
  getRunInGame,
  getSaveDeploy,
  getState,
  makeRegistry,
  markDisposed,
  markRunInGameDiagnosticsAvailable,
  type RunInGameTransition,
  type SaveDeployTransition,
  transitionRunInGame,
  transitionSaveDeploy,
} from "./registry.js";
import { buildStandardRunInGameSourceSnapshotProof } from "./sourceSnapshot.js";

export interface StudioOperationRuntimeApi {
  readonly identity: StudioDaemonIdentity;
  readonly runInGameStart: (
    input: StudioInputs["runInGame"]["start"]
  ) => Effect.Effect<StudioOutputs["runInGame"]["start"], StudioRuntimeFailure>;
  readonly runInGameStatus: (
    input: StudioInputs["runInGame"]["status"]
  ) => Effect.Effect<StudioOutputs["runInGame"]["status"], StudioRuntimeFailure>;
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
      serverInstanceId: nextRuntimeId("studio-server"),
      serverStartedAt: nowIso(),
    };
    const runInGameWorkspaceRoot = args.ports.runInGameWorkspaceRoot;
    const registry = yield* makeRegistry(identity);
    const admissionGate = yield* Effect.makeSemaphore(1);
    const fibers = yield* FiberSet.make<void, never>();
    const runInGameWorkflow = yield* RunInGameWorkflow;
    const saveDeployWorkflow = yield* SaveDeployWorkflow;
    const autoplayWorkflow = yield* AutoplayWorkflow;
    const eventHub = yield* StudioEventHub;

    const persistedOperation = (
      operation: RuntimeEventOperation
    ): Effect.Effect<RuntimeEventOperation, never> =>
      operation.kind !== "run-in-game"
        ? Effect.succeed(operation)
        : writeRunDiagnostics(operation, { workspaceRoot: runInGameWorkspaceRoot }).pipe(
            Effect.flatMap(() =>
              markRunInGameDiagnosticsAvailable(
                registry,
                operation.requestId,
                operation.operationRevision
              )
            ),
            Effect.map((marked) => marked ?? operation),
            Effect.catchAll((error) =>
              Effect.sync(() => {
                console.error("[studio-server] failed to persist run diagnostics", error);
                return operation;
              })
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
            }).pipe(Effect.flatMap(publish), Effect.asVoid),
        },
      });

    const transitionRun = (requestId: string, transition: RunInGameTransition) =>
      transitionRunInGame({ registry, requestId, nowIso: nowIso(), transition }).pipe(
        Effect.flatMap(publish)
      );

    const transitionSave = (requestId: string, transition: SaveDeployTransition) =>
      transitionSaveDeploy({ registry, requestId, nowIso: nowIso(), transition }).pipe(
        Effect.flatMap(publish)
      );

    const api: StudioOperationRuntimeApi = {
      identity,
      runInGameStart: (input) =>
        admissionGate.withPermits(1)(
          Effect.gen(function* () {
            const requestId = nextRuntimeId("studio-run-in-game");
            yield* ensureRuntimeOpen({
              registry,
              nowMs: nowMs(),
              nowIso: nowIso(),
              ttlMs: args.ttlMs,
            });
            const prepared = yield* prepareRunInGameRequest(input, requestId);
            const admitted = yield* admitRunInGame({
              registry,
              nowMs: nowMs(),
              nowIso: nowIso(),
              ttlMs: args.ttlMs,
              requestId,
              prepared,
            });
            if (admitted.admitted) {
              if (admitted.eventOperation) yield* publish(admitted.eventOperation);
              const publicOperation = yield* getRunInGame({
                registry,
                requestId: admitted.operation.requestId,
                nowMs: nowMs(),
                nowIso: nowIso(),
                ttlMs: args.ttlMs,
              });
              yield* runWorker(runInGameWorker(admitted.operation.requestId, input, prepared));
              return publicOperation;
            }
            return admitted.operation;
          })
        ),
      runInGameStatus: (input) =>
        getRunInGame({
          registry,
          requestId: input.requestId,
          nowMs: nowMs(),
          nowIso: nowIso(),
          ttlMs: args.ttlMs,
        }),
      runInGameDiagnostics: (input) =>
        lookupRunDiagnostics(input.diagnosticsId, { workspaceRoot: runInGameWorkspaceRoot }),
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
): Effect.Effect<RunInGamePreparedRequest, StudioRuntimeFailure> {
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
  if (!isRecord(input.config)) {
    return Effect.fail(
      invalidRequest({
        message: "Run in Game requires a sanitized config object.",
        diagnostics: { code: "run-in-game-config-invalid" },
      })
    );
  }
  const selected = input.selectedConfig ?? {};
  const materializationMode = input.materialization?.mode === "durable" ? "durable" : "disposable";
  const seed = parseSeed(input.seed);
  if (!seed.ok) {
    return Effect.fail(
      invalidRequest({
        message: formatSeedError(seed),
        diagnostics: { code: "run-in-game-seed-invalid" },
      })
    );
  }
  const mapSize = typeof input.mapSize === "string" ? input.mapSize : "MAPSIZE_STANDARD";
  if (!/^MAPSIZE_[A-Z0-9_]+$/.test(mapSize)) {
    return Effect.fail(
      invalidRequest({
        message: "Run in Game mapSize must be a Civ7 MAPSIZE_* value",
        diagnostics: { code: "run-in-game-map-size-invalid" },
      })
    );
  }
  const playerCount = input.playerCount === undefined ? undefined : Number(input.playerCount);
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
  if (input.recipeId !== undefined && input.recipeId !== "mod-swooper-maps/standard") {
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
  const selectedConfigId =
    materializationMode === "durable" &&
    typeof selected.id === "string" &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(selected.id)
      ? selected.id
      : "studio-current";
  const sourceSnapshot = buildStandardRunInGameSourceSnapshotProof({
    requestId,
    input,
  });
  const request: RunInGameRequestStatus = {
    recipeId: input.recipeId ?? "mod-swooper-maps/standard",
    seed: seed.value,
    mapSize,
    ...(playerCount === undefined ? {} : { playerCount }),
    ...(typeof input.resources === "string" ? { resources: input.resources } : {}),
    selectedConfigId,
    setupConfig: setupConfig.value,
    materializationMode,
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
  return Effect.succeed({
    fingerprint,
    request: {
      ...request,
      fingerprint,
    },
  });
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
