import type {
  MapConfigSaveDeployStatus,
  RunInGameOperationStatus,
  StudioLiveGameEvent,
  StudioOperationEvent,
  StudioOperationsCurrent,
} from "@civ7/studio-contract";
import type { LiveRuntimeStatusState } from "../features/liveRuntime/model";

export interface StudioOperationAdoptionTargets {
  setRunInGameOperation(operation: RunInGameOperationStatus | null): void;
  setSaveDeployOperation(operation: MapConfigSaveDeployStatus | null): void;
  markRunInGameToastHandled(requestId: string): void;
}

export function adoptStudioOperationsCurrent(
  current: StudioOperationsCurrent,
  targets: StudioOperationAdoptionTargets,
  options: Readonly<{
    currentRunInGameOperation?: RunInGameOperationStatus | null;
    currentSaveDeployOperation?: MapConfigSaveDeployStatus | null;
  }> = {}
): void {
  const runInGame = current.runInGame.active ?? current.runInGame.recent[0] ?? null;
  if (runInGame) {
    const currentRunInGameOperation = options.currentRunInGameOperation ?? null;
    const operation = runInGame;
    targets.setRunInGameOperation(operation);
    if (
      isTerminalRunInGameOperation(operation) &&
      !isSameTerminalRunInGameOperation(operation, currentRunInGameOperation)
    ) {
      targets.markRunInGameToastHandled(operation.requestId);
    }
  } else {
    targets.setRunInGameOperation(null);
  }

  const saveDeploy = current.saveDeploy.active ?? current.saveDeploy.recent[0] ?? null;
  targets.setSaveDeployOperation(saveDeploy);
}

export function applyStudioOperationEvent(
  event: StudioOperationEvent,
  targets: Pick<StudioOperationAdoptionTargets, "setRunInGameOperation" | "setSaveDeployOperation">
): void {
  if (event.kind === "run-in-game") {
    targets.setRunInGameOperation(event.status);
    return;
  }
  targets.setSaveDeployOperation(event.status);
}

export function applyStudioLiveGameEvent(
  event: StudioLiveGameEvent,
  targets: { applyLiveGameState(state: LiveRuntimeStatusState): void }
): void {
  targets.applyLiveGameState(event.state as LiveRuntimeStatusState);
}

export async function readAndAdoptStudioOperationsCurrent(
  args: Readonly<{
    readCurrent(): Promise<StudioOperationsCurrent>;
    targets: StudioOperationAdoptionTargets;
    isCancelled?: () => boolean;
    getCurrentRunInGameOperation?: () => RunInGameOperationStatus | null;
    getCurrentSaveDeployOperation?: () => MapConfigSaveDeployStatus | null;
    shouldAdopt?(current: StudioOperationsCurrent): boolean;
    onAdopted?(current: StudioOperationsCurrent): void;
    onError(message: string): void;
  }>
): Promise<void> {
  try {
    const current = await args.readCurrent();
    if (args.isCancelled?.()) return;
    if (args.shouldAdopt && !args.shouldAdopt(current)) return;
    adoptStudioOperationsCurrent(current, args.targets, {
      currentRunInGameOperation: args.getCurrentRunInGameOperation?.() ?? null,
      currentSaveDeployOperation: args.getCurrentSaveDeployOperation?.() ?? null,
    });
    args.onAdopted?.(current);
  } catch (err) {
    if (args.isCancelled?.()) return;
    args.onError(err instanceof Error ? err.message : "Unable to read current Studio operations");
  }
}

type TerminalRunInGameOperationStatus = Exclude<RunInGameOperationStatus, { status: "running" }>;

function isTerminalRunInGameOperation(
  operation: RunInGameOperationStatus
): operation is TerminalRunInGameOperationStatus {
  return operation.status !== "running";
}

function isSameTerminalRunInGameOperation(
  incoming: TerminalRunInGameOperationStatus,
  local: RunInGameOperationStatus | null
): boolean {
  return (
    local !== null && incoming.requestId === local.requestId && isTerminalRunInGameOperation(local)
  );
}
