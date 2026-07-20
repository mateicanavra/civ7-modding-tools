import type {
  MapConfigSaveDeployKind,
  MapConfigSaveDeployPhase,
  MapConfigSaveDeployStatus,
  SaveDeploySafeFailureCategory,
  StudioRecoveryAction,
} from "@civ7/studio-contract";

export function kindForMapConfigSaveDeployPhase(
  phase: MapConfigSaveDeployPhase
): MapConfigSaveDeployKind {
  if (phase === "idle") return "idle";
  if (phase === "complete") return "complete";
  if (phase === "failed") return "failed";
  return "running";
}

type NonTerminalPhase = Exclude<MapConfigSaveDeployPhase, "complete" | "failed">;

type NonTerminalStatus = Extract<
  MapConfigSaveDeployStatus,
  { ok: true; status: "idle" | "running" }
>;
type CompleteStatus = Extract<MapConfigSaveDeployStatus, { status: "complete" }>;
type FailedStatus = Extract<MapConfigSaveDeployStatus, { ok: false }>;

type NonTerminalStatusArgs = Readonly<{
  requestId: string;
  phase: NonTerminalPhase;
  saved?: boolean;
  deployed?: boolean;
  recoveryActions?: ReadonlyArray<StudioRecoveryAction>;
}>;

type CompleteStatusArgs = Readonly<{
  requestId: string;
  phase: "complete";
  recoveryActions?: ReadonlyArray<StudioRecoveryAction>;
}>;

type FailedStatusArgs = Readonly<{
  requestId: string;
  phase: "failed";
  saved?: boolean;
  deployed?: boolean;
  safeFailureCategory: SaveDeploySafeFailureCategory;
  recoveryActions?: ReadonlyArray<StudioRecoveryAction>;
}>;

type CreateMapConfigSaveDeployStatusArgs =
  | NonTerminalStatusArgs
  | CompleteStatusArgs
  | FailedStatusArgs;

export function createMapConfigSaveDeployStatus(args: NonTerminalStatusArgs): NonTerminalStatus;
export function createMapConfigSaveDeployStatus(args: CompleteStatusArgs): CompleteStatus;
export function createMapConfigSaveDeployStatus(args: FailedStatusArgs): FailedStatus;
export function createMapConfigSaveDeployStatus(
  args: CreateMapConfigSaveDeployStatusArgs
): MapConfigSaveDeployStatus {
  const recoveryActions = [...(args.recoveryActions ?? [])];
  if (args.phase === "complete") {
    return {
      ok: true,
      requestId: args.requestId,
      phase: "complete",
      status: "complete",
      saved: true,
      deployed: true,
      recoveryActions,
    };
  }
  if (args.phase === "failed") {
    return {
      ok: false,
      requestId: args.requestId,
      phase: "failed",
      status: "failed",
      saved: args.saved ?? false,
      deployed: args.deployed ?? false,
      safeFailureCategory: args.safeFailureCategory,
      recoveryActions,
    };
  }
  return {
    ok: true,
    requestId: args.requestId,
    phase: args.phase,
    status: args.phase === "idle" ? "idle" : "running",
    ...(args.saved === undefined ? {} : { saved: args.saved }),
    ...(args.deployed === undefined ? {} : { deployed: args.deployed }),
    recoveryActions,
  };
}

type UpdateMapConfigSaveDeployStatusPatch =
  | Readonly<{
      phase: NonTerminalPhase;
      saved?: boolean;
      deployed?: boolean;
      recoveryActions?: ReadonlyArray<StudioRecoveryAction>;
    }>
  | Readonly<{
      phase: "complete";
      recoveryActions?: ReadonlyArray<StudioRecoveryAction>;
    }>
  | Readonly<{
      phase: "failed";
      saved?: boolean;
      deployed?: boolean;
      safeFailureCategory: SaveDeploySafeFailureCategory;
      recoveryActions?: ReadonlyArray<StudioRecoveryAction>;
    }>;

export function updateMapConfigSaveDeployStatus(
  current: MapConfigSaveDeployStatus,
  patch: UpdateMapConfigSaveDeployStatusPatch
): MapConfigSaveDeployStatus {
  if (patch.phase === "failed") {
    return createMapConfigSaveDeployStatus({
      requestId: current.requestId,
      phase: "failed",
      saved: patch.saved ?? current.saved,
      deployed: patch.deployed ?? current.deployed,
      safeFailureCategory: patch.safeFailureCategory,
      recoveryActions: patch.recoveryActions ?? current.recoveryActions,
    });
  }
  if (patch.phase === "complete") {
    return createMapConfigSaveDeployStatus({
      requestId: current.requestId,
      phase: "complete",
      recoveryActions: patch.recoveryActions ?? current.recoveryActions,
    });
  }
  return createMapConfigSaveDeployStatus({
    requestId: current.requestId,
    phase: patch.phase,
    saved: patch.saved ?? current.saved,
    deployed: patch.deployed ?? current.deployed,
    recoveryActions: patch.recoveryActions ?? current.recoveryActions,
  });
}

type SaveDeployTerminalStatus = Extract<
  MapConfigSaveDeployStatus,
  { status: "complete" | "failed" }
>;

export function isSaveDeployTerminal(
  status: MapConfigSaveDeployStatus
): status is SaveDeployTerminalStatus {
  return status.status === "complete" || status.status === "failed";
}

export function saveDeployResultFromTerminalStatus(
  status: MapConfigSaveDeployStatus
): MapConfigSaveDeployStatus {
  return { ...status, recoveryActions: [...status.recoveryActions] };
}

export function saveDeployFailureMessage(category: SaveDeploySafeFailureCategory): string {
  switch (category) {
    case "request-validation":
      return "Save/Deploy request could not be accepted.";
    case "ownership":
      return "Save/Deploy is blocked by another Studio operation.";
    case "dependency-unavailable":
      return "Save/Deploy dependency is unavailable.";
    case "save":
      return "Saving the map configuration failed.";
    case "deployment":
      return "Deploying the map configuration failed.";
    case "cleanup":
      return "Save/Deploy recovery failed.";
    case "internal-defect":
      return "Save/Deploy failed.";
  }
}
