import type {
  MapConfigSaveDeployStatus,
  RunInGameOperationStatus,
  StudioLiveGameEvent,
  StudioOperationEvent,
  StudioOperationsCurrent,
} from "@civ7/studio-contract";
import type { LiveRuntimeStatusState } from "../features/liveRuntime/model";
import { isSaveDeployTerminal } from "../features/mapConfigSave/status";

export interface StudioOperationAdoptionTargets {
  setRunInGameOperation(update: StudioOperationStateUpdate<RunInGameOperationStatus>): void;
  setSaveDeployOperation(update: StudioOperationStateUpdate<MapConfigSaveDeployStatus>): void;
  markRunInGameToastHandled(requestId: string): void;
}

export type StudioOperationStateUpdate<Operation> =
  | Operation
  | null
  | ((current: Operation | null) => Operation | null);

/** Preserves a terminal result when an older start response or event arrives later. */
export function mergeRunInGameOperation(
  current: RunInGameOperationStatus | null,
  incoming: RunInGameOperationStatus
): RunInGameOperationStatus {
  if (current?.requestId === incoming.requestId && isTerminalRunInGameOperation(current)) {
    return current;
  }
  return incoming;
}

/** Preserves a terminal result when an older save/deploy status arrives later. */
export function mergeSaveDeployOperation(
  current: MapConfigSaveDeployStatus | null,
  incoming: MapConfigSaveDeployStatus
): MapConfigSaveDeployStatus {
  if (
    current?.requestId === incoming.requestId &&
    isSaveDeployTerminal(current) &&
    !isSaveDeployTerminal(incoming)
  ) {
    return current;
  }
  return incoming;
}

/** A client-derived failed response cannot replace terminal daemon evidence. */
export function mergeSaveDeployFailureResponse(
  current: MapConfigSaveDeployStatus | null,
  incoming: Extract<MapConfigSaveDeployStatus, { ok: false }>
): MapConfigSaveDeployStatus | null {
  if (current?.requestId !== incoming.requestId) return current;
  return isSaveDeployTerminal(current) ? current : incoming;
}

export function adoptStudioOperationsCurrent(
  current: StudioOperationsCurrent,
  targets: StudioOperationAdoptionTargets,
  options: Readonly<{
    currentRunInGameOperation?: RunInGameOperationStatus | null;
  }> = {}
): void {
  const runInGame = current.runInGame.active ?? current.runInGame.recent[0] ?? null;
  if (runInGame) {
    const currentRunInGameOperation = options.currentRunInGameOperation ?? null;
    const operation = runInGame;
    targets.setRunInGameOperation(operation);
    if (
      isTerminalRunInGameOperation(operation) &&
      shouldMarkTerminalRunInGameHandled(operation, currentRunInGameOperation)
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
  switch (event.kind) {
    case "run-in-game":
      targets.setRunInGameOperation((current) => mergeRunInGameOperation(current, event.status));
      return;
    case "save-deploy":
      targets.setSaveDeployOperation((current) => mergeSaveDeployOperation(current, event.status));
      return;
    default:
      return unhandledStudioOperationEvent(event);
  }
}

function unhandledStudioOperationEvent(event: never): never {
  throw new Error(`Unhandled Studio operation event: ${String(event)}`);
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

function shouldMarkTerminalRunInGameHandled(
  incoming: TerminalRunInGameOperationStatus,
  local: RunInGameOperationStatus | null
): boolean {
  return local === null || incoming.requestId !== local.requestId;
}
