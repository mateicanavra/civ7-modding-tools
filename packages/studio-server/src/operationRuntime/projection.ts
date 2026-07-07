import type {
  MapConfigSaveDeployStatus,
  StudioOperationEvent,
  StudioOperationsCurrent,
} from "@civ7/studio-contract";
import { type RunInGameOperationStatus, type RunInGamePhase } from "@civ7/studio-contract";
import type { StudioRecoveryAction, StudioRuntimeFailure } from "../errors/index.js";
import { publicRunInGameFailureCategory } from "../runInGamePublic.js";
import type {
  RegistryState,
  RunInGameInternalOperation,
  SaveDeployInternalOperation,
} from "./model.js";
import { publicRunInGamePhase, publicSaveDeployPhase } from "./model.js";

export function projectRunInGame(operation: RunInGameInternalOperation): RunInGameOperationStatus {
  const phase = publicRunInGamePhase(operation.phase);
  return {
    requestId: operation.requestId,
    status: publicRunInGameStatus(operation),
    phase: publicRunInGameTerminalPhase(operation, phase),
    ...(operation.failure === undefined
      ? {}
      : { safeFailureCategory: publicRunInGameFailureCategory(operation.failure) }),
    ...(operation.diagnosticsId === undefined ||
    operation.diagnosticsPersistedRevision !== operation.operationRevision
      ? {}
      : { diagnosticsId: operation.diagnosticsId }),
    recoveryActions:
      operation.failure === undefined && operation.phase === "complete"
        ? ["copy-diagnostics"]
        : runInGameRecoveryActions(operation, operation.failure),
    createdAt: operation.startedAt,
    updatedAt: operation.updatedAt,
    ...(operation.status === "running" ? {} : { terminalAt: operation.updatedAt }),
  };
}

export function projectSaveDeploy(
  operation: SaveDeployInternalOperation
): MapConfigSaveDeployStatus {
  const phase = publicSaveDeployPhase(operation.phase);
  const recoveryActions =
    operation.failure === undefined && operation.phase === "complete"
      ? ["copy-diagnostics" as const]
      : saveDeployRecoveryActions(
          operation.failedAtPhase ?? (phase === "deploying" ? "deploying" : "saving"),
          operation.failure
        );
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
  const runInGame = Object.values(state.runInGame).map(projectRunInGame).sort(byUpdatedAtDesc);
  const saveDeploy = Object.values(state.saveDeploy).map(projectSaveDeploy).sort(byUpdatedAtDesc);
  const activeRunInGame = runInGame.find(isRunningOperation) ?? null;
  const activeSaveDeploy = saveDeploy.find(isRunningOperation) ?? null;
  return {
    ok: true,
    serverInstanceId: state.identity.serverInstanceId,
    serverStartedAt: state.identity.serverStartedAt,
    observedAt,
    runInGame: {
      active: activeRunInGame,
      recent: runInGame.filter(isTerminalOperation),
    },
    saveDeploy: {
      active: activeSaveDeploy,
      recent: saveDeploy.filter(isTerminalOperation),
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

function byUpdatedAtDesc(left: { updatedAt: string }, right: { updatedAt: string }): number {
  return Date.parse(right.updatedAt) - Date.parse(left.updatedAt);
}

function isRunningOperation(operation: { status: string }): boolean {
  return operation.status === "running";
}

function isTerminalOperation(operation: { status: string }): boolean {
  return operation.status !== "running";
}

function runInGameRecoveryActions(
  operation: RunInGameInternalOperation,
  failure?: StudioRuntimeFailure
): StudioRecoveryAction[] {
  const actions: StudioRecoveryAction[] = ["copy-diagnostics"];
  if (operation.status === "running" || operation.status === "failed") {
    actions.push("retry-status");
  }
  if (operation.status !== "running" && operation.phase !== "complete") actions.push("retry-run");
  if (failure) actions.push(...failure.recoveryActions);
  return [...new Set(actions)];
}

function publicRunInGameStatus(
  operation: RunInGameInternalOperation
): RunInGameOperationStatus["status"] {
  if (operation.phase === "complete") return "completed";
  if (operation.status === "running") return "running";
  return "failed";
}

function publicRunInGameTerminalPhase(
  operation: RunInGameInternalOperation,
  projected: RunInGamePhase
): RunInGamePhase {
  if (operation.phase === "complete") return "completed";
  if (operation.status !== "running") return "failed";
  return projected;
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
