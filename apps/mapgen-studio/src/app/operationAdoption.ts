import type {
  StudioLiveGameEvent,
  StudioOperationEvent,
  StudioOperationsCurrent,
} from "@civ7/studio-server";

import type { MapConfigSaveDeployStatus } from "../features/mapConfigSave/status";
import type { LiveRuntimeStatusState } from "../features/liveRuntime/model";
import {
  isRunInGameTerminalPhase,
  type RunInGameOperationStatus,
} from "../features/runInGame/status";

export interface StudioOperationAdoptionTargets {
  setRunInGameOperation(operation: RunInGameOperationStatus | null): void;
  setSaveDeployOperation(operation: MapConfigSaveDeployStatus | null): void;
  markRunInGameToastHandled(requestId: string): void;
}

export function adoptStudioOperationsCurrent(
  current: StudioOperationsCurrent,
  targets: StudioOperationAdoptionTargets,
): void {
  const runInGame = current.runInGame.active ?? current.runInGame.recent[0] ?? null;
  if (runInGame) {
    const operation = runInGame as RunInGameOperationStatus;
    targets.setRunInGameOperation(operation);
    if (isRunInGameTerminalPhase(operation.phase)) {
      targets.markRunInGameToastHandled(operation.requestId);
    }
  } else {
    targets.setRunInGameOperation(null);
  }

  const saveDeploy = current.saveDeploy.active ?? current.saveDeploy.recent[0] ?? null;
  targets.setSaveDeployOperation(saveDeploy as MapConfigSaveDeployStatus | null);
}

export function applyStudioOperationEvent(
  event: StudioOperationEvent,
  targets: Pick<StudioOperationAdoptionTargets, "setRunInGameOperation" | "setSaveDeployOperation">,
): void {
  if (event.kind === "run-in-game") {
    targets.setRunInGameOperation(event.status as RunInGameOperationStatus);
    return;
  }
  targets.setSaveDeployOperation(event.status as MapConfigSaveDeployStatus);
}

export function applyStudioLiveGameEvent(
  event: StudioLiveGameEvent,
  targets: { applyLiveGameState(state: LiveRuntimeStatusState): void },
): void {
  targets.applyLiveGameState(event.state as LiveRuntimeStatusState);
}

export async function readAndAdoptStudioOperationsCurrent(args: Readonly<{
  readCurrent(): Promise<StudioOperationsCurrent>;
  targets: StudioOperationAdoptionTargets;
  isCancelled?: () => boolean;
  onError(message: string): void;
}>): Promise<void> {
  try {
    const current = await args.readCurrent();
    if (args.isCancelled?.()) return;
    adoptStudioOperationsCurrent(current, args.targets);
  } catch (err) {
    if (args.isCancelled?.()) return;
    args.onError(err instanceof Error ? err.message : "Unable to read current Studio operations");
  }
}
