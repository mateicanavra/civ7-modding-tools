import type { MapConfigSaveDeployStatus } from "../contract/mapConfigs.js";
import type { RunInGameOperationStatus, RunInGamePhase } from "../contract/runInGame.js";
import type { StudioOperationEvent, StudioOperationsCurrent } from "../contract/studio.js";
import type { StudioRecoveryAction, StudioRuntimeFailure } from "../errors/index.js";
import type {
  RegistryState,
  RunInGameInternalOperation,
  SaveDeployInternalOperation,
} from "./model.js";
import { publicRunInGamePhase, publicSaveDeployPhase } from "./model.js";

export function projectRunInGame(operation: RunInGameInternalOperation): RunInGameOperationStatus {
  const phase = publicRunInGamePhase(operation.phase);
  const details = operation.failure
    ? runInGameFailureDetails(operation.failure, phase, operation.completedPhases)
    : undefined;
  return {
    ok: operation.failure === undefined,
    requestId: operation.requestId,
    phase,
    status: operation.status,
    startedAt: operation.startedAt,
    updatedAt: operation.updatedAt,
    serverInstanceId: undefined,
    serverStartedAt: undefined,
    completedPhases: [...operation.completedPhases],
    request: operation.request,
    ...(operation.materialization === undefined ? {} : { materialization: operation.materialization }),
    ...(operation.processRestart === undefined ? {} : { processRestart: operation.processRestart }),
    ...(operation.exactAuthorshipProof === undefined
      ? {}
      : { exactAuthorshipProof: operation.exactAuthorshipProof }),
    ...(operation.result === undefined ? {} : { result: operation.result }),
    ...(operation.failure === undefined ? {} : { error: operation.failure.message }),
    ...(details === undefined ? {} : { details }),
    recoveryActions:
      operation.failure === undefined && operation.phase === "complete"
        ? ["copy-diagnostics"]
        : runInGameRecoveryActions({ phase, status: operation.status, details }),
  };
}

export function projectSaveDeploy(operation: SaveDeployInternalOperation): MapConfigSaveDeployStatus {
  const phase = publicSaveDeployPhase(operation.phase);
  const recoveryActions =
    operation.failure === undefined && operation.phase === "complete"
      ? ["copy-diagnostics" as const]
      : saveDeployRecoveryActions(operation.failedAtPhase ?? (phase === "deploying" ? "deploying" : "saving"), operation.failure);
  const failureDetails =
    operation.failure === undefined
      ? undefined
      : {
          ...(operation.failure.diagnostics ?? {}),
          failureTag: operation.failure.tag,
          reason: operation.failure.reason,
          ...(operation.failedAtPhase === undefined
            ? {}
            : { failedAtPhase: operation.failedAtPhase }),
          recoveryActions,
        };
  return {
    ok: operation.failure === undefined,
    requestId: operation.requestId,
    phase,
    status: operation.status,
    startedAt: operation.startedAt,
    updatedAt: operation.updatedAt,
    ...(operation.path === undefined ? {} : { path: operation.path }),
    ...(operation.saved === undefined ? {} : { saved: operation.saved }),
    ...(operation.deployed === undefined ? {} : { deployed: operation.deployed }),
    ...(operation.deploy === undefined ? {} : { deploy: operation.deploy }),
    ...(operation.failure === undefined ? {} : { error: operation.failure.message }),
    ...(failureDetails === undefined ? {} : { details: failureDetails }),
    recoveryActions,
  };
}

export function projectCurrent(state: RegistryState, observedAt: string): StudioOperationsCurrent {
  const runInGame = Object.values(state.runInGame)
    .map(projectRunInGame)
    .sort(byUpdatedAtDesc);
  const saveDeploy = Object.values(state.saveDeploy)
    .map(projectSaveDeploy)
    .sort(byUpdatedAtDesc);
  return {
    ok: true,
    serverInstanceId: state.identity.serverInstanceId,
    serverStartedAt: state.identity.serverStartedAt,
    observedAt,
    runInGame: {
      active: runInGame.find((operation) => operation.status === "running") ?? null,
      recent: runInGame,
    },
    saveDeploy: {
      active: saveDeploy.find((operation) => operation.status === "running") ?? null,
      recent: saveDeploy,
    },
  };
}

export function operationEvent(
  operation: RunInGameInternalOperation | SaveDeployInternalOperation
): StudioOperationEvent {
  if (operation.kind === "run-in-game") {
    const status = projectRunInGame(operation);
    return {
      type: "operation",
      kind: "run-in-game",
      status,
      observedAt: status.updatedAt,
    };
  }
  const status = projectSaveDeploy(operation);
  return {
    type: "operation",
    kind: "save-deploy",
    status,
    observedAt: status.updatedAt,
  };
}

function byUpdatedAtDesc(
  left: { updatedAt: string },
  right: { updatedAt: string }
): number {
  return Date.parse(right.updatedAt) - Date.parse(left.updatedAt);
}

function runInGameFailureDetails(
  failure: StudioRuntimeFailure,
  phase: RunInGamePhase,
  completedPhases: readonly RunInGamePhase[]
): NonNullable<RunInGameOperationStatus["details"]> {
  const failureClass =
    failure.tag === "OperationBlocked"
      ? "blocked"
      : failure.reason === "timeout-uncertain" || failure.reason === "start-game-failed"
        ? "uncertain"
        : "failed";
  return {
    ...(failure.diagnostics ?? {}),
    failureClass,
    phase,
    completedPhases: [...completedPhases],
    ...(typeof failure.diagnostics?.code === "string" ? { code: failure.diagnostics.code } : {}),
  };
}

function runInGameRecoveryActions(state: Pick<
  RunInGameOperationStatus,
  "phase" | "status" | "details"
>): StudioRecoveryAction[] {
  const actions: StudioRecoveryAction[] = ["copy-diagnostics"];
  if (
    state.status === "running" ||
    state.status === "blocked" ||
    state.status === "failed" ||
    state.status === "uncertain"
  ) {
    actions.push("retry-status");
  }
  if (state.status === "failed" || state.status === "blocked" || state.status === "uncertain") {
    actions.push("retry-run");
  }
  if (state.details?.reloadRequired === true || state.phase === "reload-needed") {
    actions.push("exit-to-shell-and-continue");
  }
  if (state.details?.reloadBoundary === "process-restart-required") {
    actions.push("restart-civ-process-and-retry");
  }
  if (
    state.details?.dismissNotificationRequired === true ||
    state.details?.recoveryBoundary === "civ-notification-dismiss"
  ) {
    actions.push("dismiss-civ-notification-and-retry");
  }
  return [...new Set(actions)];
}

function saveDeployRecoveryActions(
  phase: "saving" | "deploying",
  failure?: StudioRuntimeFailure
): StudioRecoveryAction[] {
  const actions: StudioRecoveryAction[] = ["copy-diagnostics", "retry-status", "retry-save-deploy"];
  if (phase === "deploying") actions.push("inspect-deploy-output");
  if (failure) actions.push(...failure.recoveryActions);
  return [...new Set(actions)];
}
