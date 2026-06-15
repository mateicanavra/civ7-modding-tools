import { Effect, SynchronizedRef } from "effect";

import type { MapConfigSaveDeployStatus } from "../contract/mapConfigs.js";
import type {
  RunInGameExactAuthorshipProof,
  RunInGameMaterializationStatus,
  RunInGameOperationStatus,
  RunInGamePhase,
  RunInGameProcessRestartStatus,
} from "../contract/runInGame.js";
import {
  invalidRequest,
  isStudioRuntimeFailure,
  operationBlocked,
  operationExpired,
  operationNotFound,
  runtimeDisposed,
  type StudioRuntimeFailure,
} from "../errors/index.js";
import type {
  RegistryState,
  RunInGameInternalOperation,
  RuntimeActiveSlot,
  SaveDeployInternalOperation,
} from "./model.js";
import {
  emptyRegistry,
  OPERATION_TTL_MS,
  publicRunInGamePhase,
  statusForRunInGamePhase,
  statusForSaveDeployPhase,
} from "./model.js";
import type { RunInGamePreparedRequest, StudioDaemonIdentity } from "./ports.js";
import { projectRunInGame, projectSaveDeploy } from "./projection.js";

export type RuntimeRegistry = SynchronizedRef.SynchronizedRef<RegistryState>;

export type Admission<Operation> = Readonly<{
  operation: Operation;
  admitted: boolean;
  eventOperation?: RunInGameInternalOperation | SaveDeployInternalOperation;
}>;

export type RunInGameTransition =
  | Readonly<{ phase: "materializing"; materialization?: RunInGameMaterializationStatus }>
  | Readonly<{ phase: "deploying"; materialization?: RunInGameMaterializationStatus }>
  | Readonly<{ phase: "restarting-civ" }>
  | Readonly<{
      phase: "checking-civ7";
      materialization?: RunInGameMaterializationStatus;
      processRestart?: RunInGameProcessRestartStatus;
    }>
  | Readonly<{ phase: "preparing-setup" }>
  | Readonly<{ phase: "reload-needed" }>
  | Readonly<{ phase: "starting-game" }>
  | Readonly<{ phase: "waiting-for-proof" }>
  | Readonly<{
      phase: "complete";
      result?: unknown;
      materialization?: RunInGameMaterializationStatus;
      exactAuthorshipProof?: RunInGameExactAuthorshipProof;
    }>;

export type RunInGameFailurePhase = Exclude<RunInGameTransition["phase"], "complete">;

export type SaveDeployTransition =
  | Readonly<{ phase: "saving"; path?: string }>
  | Readonly<{ phase: "deploying"; path?: string; saved?: boolean }>
  | Readonly<{
      phase: "complete";
      path?: string;
      saved?: boolean;
      deployed?: boolean;
      deploy?: MapConfigSaveDeployStatus["deploy"];
    }>;

export function makeRegistry(identity: StudioDaemonIdentity): Effect.Effect<RuntimeRegistry> {
  return SynchronizedRef.make(emptyRegistry(identity));
}

export function markDisposed(
  registry: RuntimeRegistry,
  nowIso: string,
  failure: StudioRuntimeFailure
): Effect.Effect<ReadonlyArray<RunInGameInternalOperation | SaveDeployInternalOperation>> {
  return SynchronizedRef.modify(registry, (state) => {
    const runInGame = mapRecord(state.runInGame, (operation) =>
      operation.status === "running"
        ? failRunOperation(operation, nowIso, failure, failurePhaseForRunOperation(operation))
        : operation
    );
    const saveDeploy = mapRecord(state.saveDeploy, (operation) =>
      operation.status === "running"
        ? failSaveOperation(
            operation,
            nowIso,
            failure,
            operation.phase === "deploying" ? "deploying" : "saving"
          )
        : operation
    );
    const next = {
      ...state,
      disposed: true,
      active: null,
      runInGame,
      saveDeploy,
    };
    return [
      [
        ...changedOperations(state.runInGame, runInGame),
        ...changedOperations(state.saveDeploy, saveDeploy),
      ],
      next,
    ] as const;
  });
}

export function admitRunInGame(
  args: Readonly<{
    registry: RuntimeRegistry;
    nowMs: number;
    nowIso: string;
    ttlMs?: number;
    requestId: string;
    prepared: RunInGamePreparedRequest;
  }>
): Effect.Effect<Admission<RunInGameOperationStatus>, StudioRuntimeFailure> {
  return SynchronizedRef.modifyEffect(args.registry, (raw) => {
    const state = prune(raw, args.nowMs, args.nowIso, args.ttlMs);
    if (state.disposed) return Effect.fail(runtimeDisposedFailure());
    const duplicate = Object.values(state.runInGame).find(
      (operation) => operation.fingerprint === args.prepared.fingerprint
    );
    if (duplicate) {
      const projected = projectRunInGame(duplicate);
      return Effect.succeed([
        {
          admitted: false,
          operation: {
            ...projected,
            details: {
              ...(projected.details ?? {}),
              duplicateRequest: true,
              activeRequestId: duplicate.requestId,
              code: "run-in-game-operation-known",
            },
          } as RunInGameOperationStatus,
        },
        state,
      ] as readonly [Admission<RunInGameOperationStatus>, RegistryState]);
    }
    const expired = Object.values(state.tombstones).find(
      (tombstone) =>
        tombstone.kind === "run-in-game" && tombstone.fingerprint === args.prepared.fingerprint
    );
    if (expired) {
      return Effect.fail(
        operationExpired({
          message: `Run in Game request expired: ${expired.requestId}`,
          requestId: expired.requestId,
          diagnostics: { code: "run-in-game-request-expired" },
        })
      );
    }
    const blocked = activeBlocked(state.active);
    if (blocked) return Effect.fail(blocked);
    const operation: RunInGameInternalOperation = {
      kind: "run-in-game",
      requestId: args.requestId,
      fingerprint: args.prepared.fingerprint,
      request: {
        ...args.prepared.request,
        fingerprint: args.prepared.fingerprint,
      },
      phase: "accepted",
      status: "running",
      startedAt: args.nowIso,
      updatedAt: args.nowIso,
      completedPhases: [],
    };
    return Effect.succeed([
      { admitted: true, operation: projectRunInGame(operation), eventOperation: operation },
      {
        ...state,
        active: activeSlot(operation),
        runInGame: { ...state.runInGame, [operation.requestId]: operation },
      },
    ] as readonly [Admission<RunInGameOperationStatus>, RegistryState]);
  });
}

export function transitionRunInGame(
  args: Readonly<{
    registry: RuntimeRegistry;
    requestId: string;
    nowIso: string;
    transition: RunInGameTransition;
  }>
): Effect.Effect<RunInGameInternalOperation> {
  return SynchronizedRef.modify(args.registry, (state) => {
    const current = state.runInGame[args.requestId];
    if (!current || state.disposed) {
      return [
        current ??
          ({
            kind: "run-in-game",
            requestId: args.requestId,
            fingerprint: "missing",
            request: {},
            phase: "failed",
            status: "failed",
            startedAt: args.nowIso,
            updatedAt: args.nowIso,
            completedPhases: [],
            failure: invalidRequest({
              message: `Unknown Run in Game request id: ${args.requestId}`,
              diagnostics: { code: "unknown-run-in-game-request-id" },
            }),
          } satisfies RunInGameInternalOperation),
        state,
      ] as const;
    }
    const publicCurrentPhase = publicRunInGamePhase(current.phase);
    const completedPhases =
      args.transition.phase !== current.phase &&
      current.status === "running" &&
      !current.completedPhases.includes(publicCurrentPhase)
        ? [...current.completedPhases, publicCurrentPhase]
        : current.completedPhases;
    const operation: RunInGameInternalOperation = {
      ...current,
      ...args.transition,
      status: statusForRunInGamePhase(args.transition.phase),
      completedPhases,
      updatedAt: args.nowIso,
    };
    return [
      operation,
      {
        ...state,
        active: operation.status === "running" ? activeSlot(operation) : null,
        runInGame: { ...state.runInGame, [args.requestId]: operation },
      },
    ] as const;
  });
}

export function failRunInGame(
  args: Readonly<{
    registry: RuntimeRegistry;
    requestId: string;
    nowIso: string;
    phase: RunInGameFailurePhase;
    err: unknown;
  }>
): Effect.Effect<RunInGameInternalOperation> {
  return SynchronizedRef.modify(args.registry, (state) => {
    const current = state.runInGame[args.requestId];
    if (!current || state.disposed) {
      return [
        current ??
          ({
            kind: "run-in-game",
            requestId: args.requestId,
            fingerprint: "missing",
            request: {},
            phase: "failed",
            status: "failed",
            startedAt: args.nowIso,
            updatedAt: args.nowIso,
            completedPhases: [],
            failure: toRuntimeFailure(args.err, "Run in Game failed"),
          } satisfies RunInGameInternalOperation),
        state,
      ] as const;
    }
    const failure = toRuntimeFailure(args.err, "Run in Game failed");
    const operation = failRunOperation(current, args.nowIso, failure, args.phase);
    return [
      operation,
      {
        ...state,
        active: null,
        runInGame: { ...state.runInGame, [args.requestId]: operation },
      },
    ] as const;
  });
}

export function getRunInGame(
  args: Readonly<{
    registry: RuntimeRegistry;
    requestId: string;
    nowMs: number;
    nowIso: string;
    ttlMs?: number;
  }>
): Effect.Effect<RunInGameOperationStatus, StudioRuntimeFailure> {
  return SynchronizedRef.modifyEffect(args.registry, (raw) => {
    const state = prune(raw, args.nowMs, args.nowIso, args.ttlMs);
    const operation = state.runInGame[args.requestId];
    if (operation) return Effect.succeed([projectRunInGame(operation), state] as const);
    const tombstone = state.tombstones[args.requestId];
    if (tombstone?.kind === "run-in-game") {
      return Effect.fail(
        operationExpired({
          message: `Run in Game request expired: ${args.requestId}`,
          requestId: args.requestId,
          diagnostics: { code: "run-in-game-request-expired" },
        })
      );
    }
    return Effect.fail(
      operationNotFound({
        message: `Run in Game request not found: ${args.requestId}`,
        requestId: args.requestId,
        diagnostics: { code: "run-in-game-request-not-found" },
      })
    );
  });
}

export function admitSaveDeploy(
  args: Readonly<{
    registry: RuntimeRegistry;
    nowMs: number;
    nowIso: string;
    ttlMs?: number;
    requestId: string;
    path?: string;
  }>
): Effect.Effect<Admission<MapConfigSaveDeployStatus>, StudioRuntimeFailure> {
  return SynchronizedRef.modifyEffect(args.registry, (raw) => {
    const state = prune(raw, args.nowMs, args.nowIso, args.ttlMs);
    if (state.disposed) return Effect.fail(runtimeDisposedFailure());
    const known = state.saveDeploy[args.requestId];
    if (known) {
      return Effect.succeed([
        { admitted: false, operation: projectSaveDeploy(known) },
        state,
      ] as readonly [Admission<MapConfigSaveDeployStatus>, RegistryState]);
    }
    const tombstone = state.tombstones[args.requestId];
    if (tombstone?.kind === "save-deploy") {
      return Effect.fail(
        operationExpired({
          message: `Save/Deploy request expired: ${args.requestId}`,
          requestId: args.requestId,
          diagnostics: { code: "save-deploy-request-expired" },
        })
      );
    }
    const blocked = activeBlocked(state.active);
    if (blocked) return Effect.fail(blocked);
    const operation: SaveDeployInternalOperation = {
      kind: "save-deploy",
      requestId: args.requestId,
      phase: "accepted",
      status: "running",
      startedAt: args.nowIso,
      updatedAt: args.nowIso,
      ...(args.path === undefined ? {} : { path: args.path }),
    };
    return Effect.succeed([
      { admitted: true, operation: projectSaveDeploy(operation), eventOperation: operation },
      {
        ...state,
        active: activeSlot(operation),
        saveDeploy: { ...state.saveDeploy, [operation.requestId]: operation },
      },
    ] as readonly [Admission<MapConfigSaveDeployStatus>, RegistryState]);
  });
}

export function transitionSaveDeploy(
  args: Readonly<{
    registry: RuntimeRegistry;
    requestId: string;
    nowIso: string;
    transition: SaveDeployTransition;
  }>
): Effect.Effect<SaveDeployInternalOperation> {
  return SynchronizedRef.modify(args.registry, (state) => {
    const current = state.saveDeploy[args.requestId];
    if (!current || state.disposed) {
      return [
        current ??
          ({
            kind: "save-deploy",
            requestId: args.requestId,
            phase: "failed",
            status: "failed",
            startedAt: args.nowIso,
            updatedAt: args.nowIso,
            failure: invalidRequest({
              message: `Unknown Save/Deploy request id: ${args.requestId}`,
              diagnostics: { code: "unknown-save-deploy-request-id" },
            }),
          } satisfies SaveDeployInternalOperation),
        state,
      ] as const;
    }
    const operation: SaveDeployInternalOperation = {
      ...current,
      ...args.transition,
      status: statusForSaveDeployPhase(args.transition.phase),
      updatedAt: args.nowIso,
    };
    return [
      operation,
      {
        ...state,
        active: operation.status === "running" ? activeSlot(operation) : null,
        saveDeploy: { ...state.saveDeploy, [args.requestId]: operation },
      },
    ] as const;
  });
}

export function failSaveDeploy(
  args: Readonly<{
    registry: RuntimeRegistry;
    requestId: string;
    nowIso: string;
    phase: "saving" | "deploying";
    err: unknown;
  }>
): Effect.Effect<SaveDeployInternalOperation> {
  return SynchronizedRef.modify(args.registry, (state) => {
    const current = state.saveDeploy[args.requestId];
    if (!current || state.disposed) {
      return [
        current ??
          ({
            kind: "save-deploy",
            requestId: args.requestId,
            phase: "failed",
            status: "failed",
            startedAt: args.nowIso,
            updatedAt: args.nowIso,
            failure: toRuntimeFailure(args.err, "Save failed"),
          } satisfies SaveDeployInternalOperation),
        state,
      ] as const;
    }
    const failure = toRuntimeFailure(args.err, "Save failed");
    const operation = failSaveOperation(current, args.nowIso, failure, args.phase);
    return [
      operation,
      {
        ...state,
        active: null,
        saveDeploy: { ...state.saveDeploy, [args.requestId]: operation },
      },
    ] as const;
  });
}

export function getSaveDeploy(
  args: Readonly<{
    registry: RuntimeRegistry;
    requestId: string;
    nowMs: number;
    nowIso: string;
    ttlMs?: number;
  }>
): Effect.Effect<MapConfigSaveDeployStatus, StudioRuntimeFailure> {
  return SynchronizedRef.modifyEffect(args.registry, (raw) => {
    const state = prune(raw, args.nowMs, args.nowIso, args.ttlMs);
    const operation = state.saveDeploy[args.requestId];
    if (operation) return Effect.succeed([projectSaveDeploy(operation), state] as const);
    const tombstone = state.tombstones[args.requestId];
    if (tombstone?.kind === "save-deploy") {
      return Effect.fail(
        operationExpired({
          message: `Save/Deploy request expired: ${args.requestId}`,
          requestId: args.requestId,
          diagnostics: { code: "save-deploy-request-expired" },
        })
      );
    }
    return Effect.fail(
      operationNotFound({
        message: `Save/Deploy request not found: ${args.requestId}`,
        requestId: args.requestId,
        diagnostics: { code: "save-deploy-request-not-found" },
      })
    );
  });
}

export function getState(
  registry: RuntimeRegistry,
  nowMs: number,
  nowIso: string,
  ttlMs?: number
): Effect.Effect<RegistryState> {
  return SynchronizedRef.modify(registry, (state) => {
    const next = prune(state, nowMs, nowIso, ttlMs);
    return [next, next] as const;
  });
}

export function ensureAdmissionOpen(
  args: Readonly<{
    registry: RuntimeRegistry;
    nowMs: number;
    nowIso: string;
    ttlMs?: number;
  }>
): Effect.Effect<void, StudioRuntimeFailure> {
  return SynchronizedRef.modifyEffect(args.registry, (raw) => {
    const state = prune(raw, args.nowMs, args.nowIso, args.ttlMs);
    if (state.disposed) return Effect.fail(runtimeDisposedFailure());
    const blocked = activeBlocked(state.active);
    if (blocked) return Effect.fail(blocked);
    return Effect.succeed([undefined, state] as const);
  });
}

export function ensureRuntimeOpen(
  args: Readonly<{
    registry: RuntimeRegistry;
    nowMs: number;
    nowIso: string;
    ttlMs?: number;
  }>
): Effect.Effect<void, StudioRuntimeFailure> {
  return SynchronizedRef.modifyEffect(args.registry, (raw) => {
    const state = prune(raw, args.nowMs, args.nowIso, args.ttlMs);
    if (state.disposed) return Effect.fail(runtimeDisposedFailure());
    return Effect.succeed([undefined, state] as const);
  });
}

function prune(
  state: RegistryState,
  nowMs: number,
  nowIso: string,
  ttlMs = OPERATION_TTL_MS
): RegistryState {
  const cutoff = nowMs - ttlMs;
  let active = state.active;
  const tombstones = { ...state.tombstones };
  const runInGame = filterRecord(state.runInGame, (operation) => {
    if (operation.status === "running" || Date.parse(operation.updatedAt) >= cutoff) return true;
    tombstones[operation.requestId] = {
      requestId: operation.requestId,
      kind: "run-in-game",
      fingerprint: operation.fingerprint,
      expiredAt: nowIso,
      lastUpdatedAt: operation.updatedAt,
    };
    if (active?.requestId === operation.requestId) active = null;
    return false;
  });
  const saveDeploy = filterRecord(state.saveDeploy, (operation) => {
    if (operation.status === "running" || Date.parse(operation.updatedAt) >= cutoff) return true;
    tombstones[operation.requestId] = {
      requestId: operation.requestId,
      kind: "save-deploy",
      expiredAt: nowIso,
      lastUpdatedAt: operation.updatedAt,
    };
    if (active?.requestId === operation.requestId) active = null;
    return false;
  });
  return { ...state, active, runInGame, saveDeploy, tombstones };
}

function activeBlocked(active: RuntimeActiveSlot | null): StudioRuntimeFailure | undefined {
  if (!active) return undefined;
  return operationBlocked({
    message: `${active.kind} is running; wait for it to finish before starting another Studio operation.`,
    activeRequestId: active.requestId,
    activePhase: active.phase,
    diagnostics: { code: "studio-operation-active" },
  });
}

function activeSlot(
  operation: RunInGameInternalOperation | SaveDeployInternalOperation
): RuntimeActiveSlot {
  return {
    kind: operation.kind,
    requestId: operation.requestId,
    phase: operation.phase,
  };
}

function failRunOperation(
  operation: RunInGameInternalOperation,
  nowIso: string,
  failure: StudioRuntimeFailure,
  phase: RunInGameFailurePhase
): RunInGameInternalOperation {
  const failureClass =
    failure.tag === "OperationBlocked"
      ? "blocked"
      : failure.reason === "timeout-uncertain" || failure.reason === "start-game-failed"
        ? "uncertain"
        : "failed";
  return {
    ...operation,
    phase: failure.tag === "RuntimeDisposed" ? "runtime-disposed" : failureClass,
    status:
      failureClass === "blocked"
        ? "blocked"
        : failureClass === "uncertain"
          ? "uncertain"
          : "failed",
    updatedAt: nowIso,
    failure,
    completedPhases: operation.completedPhases.includes(phase)
      ? operation.completedPhases
      : [...operation.completedPhases, phase],
  };
}

function failurePhaseForRunOperation(operation: RunInGameInternalOperation): RunInGameFailurePhase {
  switch (operation.phase) {
    case "deploying":
    case "restarting-civ":
    case "checking-civ7":
    case "reload-needed":
    case "preparing-setup":
    case "starting-game":
    case "waiting-for-proof":
      return operation.phase;
    case "accepted":
    case "materializing":
    default:
      return "materializing";
  }
}

function failSaveOperation(
  operation: SaveDeployInternalOperation,
  nowIso: string,
  failure: StudioRuntimeFailure,
  phase: "saving" | "deploying"
): SaveDeployInternalOperation {
  return {
    ...operation,
    phase: failure.tag === "RuntimeDisposed" ? "runtime-disposed" : "failed",
    status: "failed",
    updatedAt: nowIso,
    failure,
    failedAtPhase: phase,
  };
}

function toRuntimeFailure(err: unknown, fallbackMessage: string): StudioRuntimeFailure {
  if (isStudioRuntimeFailure(err)) return err;
  return invalidRequest({
    message: err instanceof Error && err.message ? err.message : fallbackMessage,
    diagnostics: {
      code: "studio-operation-runtime-unclassified-error",
      cause: err instanceof Error && err.message ? err.message : String(err),
    },
  });
}

function runtimeDisposedFailure(): StudioRuntimeFailure {
  return runtimeDisposed({
    message: "Studio operation runtime is disposed.",
    diagnostics: { code: "studio-operation-runtime-disposed" },
  });
}

function filterRecord<T>(
  record: Readonly<Record<string, T>>,
  keep: (value: T) => boolean
): Readonly<Record<string, T>> {
  return Object.fromEntries(Object.entries(record).filter(([, value]) => keep(value)));
}

function mapRecord<T>(
  record: Readonly<Record<string, T>>,
  map: (value: T) => T
): Readonly<Record<string, T>> {
  return Object.fromEntries(Object.entries(record).map(([key, value]) => [key, map(value)]));
}

function changedOperations<T extends { requestId: string }>(
  before: Readonly<Record<string, T>>,
  after: Readonly<Record<string, T>>
): T[] {
  return Object.values(after).filter((operation) => before[operation.requestId] !== operation);
}
