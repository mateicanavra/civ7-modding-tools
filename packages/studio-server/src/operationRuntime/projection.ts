import type {
  MapConfigSaveDeployStatus,
  StudioOperationEvent,
  StudioOperationsCurrent,
} from "@civ7/studio-contract";
import { type RunInGameOperationStatus, type RunInGamePhase } from "@civ7/studio-contract";
import type { StudioRecoveryAction, StudioRuntimeFailure } from "../errors/index.js";
import { publicRunInGameFailureCategory } from "../runInGamePublic.js";
import { publicSaveDeployFailureCategory } from "../saveDeployPublic.js";
import type {
  RegistryState,
  RunInGameInternalOperation,
  SaveDeployInternalOperation,
} from "./model.js";
import { publicRunInGamePhase, publicSaveDeployPhase } from "./model.js";

export function projectRunInGame(operation: RunInGameInternalOperation): RunInGameOperationStatus {
  const phase = publicRunInGamePhase(operation.phase);
  const diagnosticsId =
    operation.diagnosticsId === undefined ||
    operation.diagnosticsPersistedRevision !== operation.operationRevision
      ? undefined
      : operation.diagnosticsId;
  const recoveryActions =
    operation.failure === undefined && operation.phase === "complete"
      ? ["copy-diagnostics" as const]
      : runInGameRecoveryActions(operation, operation.failure);
  const base = {
    requestId: operation.requestId,
    ...(diagnosticsId === undefined ? {} : { diagnosticsId }),
    recoveryActions,
  };
  const status = publicRunInGameStatus(operation);
  if (status === "completed") {
    return {
      ...base,
      status,
      phase: "completed",
    };
  }
  if (status === "running") {
    return {
      ...base,
      status,
      phase: publicRunInGameRunningPhase(phase),
    };
  }
  if (status === "cancelled") {
    return {
      ...base,
      status,
      phase: "cancelled",
      safeFailureCategory:
        operation.failure === undefined
          ? "operation-cancelled"
          : publicRunInGameFailureCategory(operation.failure),
    };
  }
  return {
    ...base,
    status,
    phase: "failed",
    safeFailureCategory:
      operation.failure === undefined
        ? "internal-defect"
        : publicRunInGameFailureCategory(operation.failure),
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
  if (operation.status === "complete") {
    return {
      ok: true,
      requestId: operation.requestId,
      phase: "complete",
      status: "complete",
      saved: true,
      deployed: true,
      recoveryActions,
    };
  }
  if (operation.status === "failed") {
    return {
      ok: false,
      requestId: operation.requestId,
      phase: "failed",
      status: "failed",
      saved: operation.saved ?? false,
      deployed: operation.deployed ?? false,
      safeFailureCategory:
        operation.failure === undefined
          ? "internal-defect"
          : publicSaveDeployFailureCategory(operation.failure),
      recoveryActions,
    };
  }
  return {
    ok: true,
    requestId: operation.requestId,
    phase: publicRunningSaveDeployPhase(operation.phase),
    status: operation.status,
    ...(operation.saved === undefined ? {} : { saved: operation.saved }),
    ...(operation.deployed === undefined ? {} : { deployed: operation.deployed }),
    recoveryActions,
  };
}

function publicRunningSaveDeployPhase(
  phase: SaveDeployInternalOperation["phase"]
): "idle" | "queued" | "saving" | "deploying" {
  switch (phase) {
    case "accepted":
    case "queued":
      return "queued";
    case "saving":
      return "saving";
    case "deploying":
      return "deploying";
    case "complete":
    case "failed":
    case "runtime-disposed":
      return "idle";
  }
}

export function projectCurrent(state: RegistryState, observedAt: string): StudioOperationsCurrent {
  const runInGame = Object.values(state.runInGame).sort(byUpdatedAtDesc).map(projectRunInGame);
  const saveDeploy = Object.values(state.saveDeploy).sort(byUpdatedAtDesc).map(projectSaveDeploy);
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
      observedAt: operation.updatedAt,
    };
  }
  const status = projectSaveDeploy(operation);
  return {
    type: "operation",
    kind: "save-deploy",
    status,
    observedAt: operation.updatedAt,
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
  if (
    operation.status === "running" ||
    operation.status === "failed" ||
    operation.status === "uncertain"
  ) {
    actions.push("retry-status");
  }
  // Cancellation is admitted only before the mutation fence, so repeating it
  // is safe. Failed operations inherit retry authority from the concrete
  // failure instead of gaining it from their terminal status.
  if (operation.status === "cancelled") actions.push("retry-run");
  if (failure && operation.status !== "uncertain") actions.push(...failure.recoveryActions);
  return [...new Set(actions)];
}

function publicRunInGameStatus(
  operation: RunInGameInternalOperation
): RunInGameOperationStatus["status"] {
  if (operation.phase === "complete") return "completed";
  if (operation.status === "cancelled") return "cancelled";
  if (operation.status === "running") return "running";
  return "failed";
}

function publicRunInGameRunningPhase(
  projected: RunInGamePhase
): Exclude<RunInGamePhase, "completed" | "failed" | "cancelled"> {
  if (projected === "completed" || projected === "failed" || projected === "cancelled") {
    return "observing-runtime";
  }
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
