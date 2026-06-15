import type {
  MapConfigSaveDeployPhase,
  MapConfigSaveDeployStatus,
  StudioRecoveryAction,
  StudioRuntimeFailure,
} from "@civ7/studio-server";
import {
  createMapConfigSaveDeployStatus,
  updateMapConfigSaveDeployStatus,
} from "../../features/mapConfigSave/status";

function recoveryActionsForSaveDeploy(phase: MapConfigSaveDeployPhase): StudioRecoveryAction[] {
  const actions: StudioRecoveryAction[] = ["copy-diagnostics", "retry-status", "retry-save-deploy"];
  if (phase === "deploying") actions.push("inspect-deploy-output");
  return actions;
}

type MapConfigSaveDeployStatusPatch = Parameters<typeof updateMapConfigSaveDeployStatus>[1];
type SaveDeployFailurePatch = Omit<
  MapConfigSaveDeployStatusPatch,
  "phase" | "error" | "details" | "recoveryActions"
>;

type StoreOptions = Readonly<{
  ttlMs: number;
  now?: () => Date;
  onChange?: (status: MapConfigSaveDeployStatus) => void;
}>;

export function createMapConfigSaveDeployOperationStore(options: StoreOptions) {
  const operations = new Map<string, MapConfigSaveDeployStatus>();
  const now = () => (options.now ?? (() => new Date()))();

  function prune(): void {
    const cutoff = now().getTime() - options.ttlMs;
    for (const [requestId, status] of operations) {
      if (Date.parse(status.updatedAt) < cutoff) operations.delete(requestId);
    }
  }

  function get(requestId: string): MapConfigSaveDeployStatus | undefined {
    prune();
    return operations.get(requestId);
  }

  function findActive(): MapConfigSaveDeployStatus | undefined {
    prune();
    return [...operations.values()].find((status) => status.status === "running");
  }

  function list(): MapConfigSaveDeployStatus[] {
    prune();
    return [...operations.values()].sort(
      (left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt)
    );
  }

  function create(requestId: string): MapConfigSaveDeployStatus {
    prune();
    const status = createMapConfigSaveDeployStatus({
      requestId,
      phase: "queued",
      now,
      recoveryActions: ["copy-diagnostics", "retry-status"],
    });
    operations.set(requestId, status);
    options.onChange?.(status);
    return status;
  }

  function update(
    requestId: string,
    patch: Parameters<typeof updateMapConfigSaveDeployStatus>[1]
  ): MapConfigSaveDeployStatus {
    const current = operations.get(requestId);
    if (!current) throw new Error(`Unknown Save/Deploy request id: ${requestId}`);
    const next = updateMapConfigSaveDeployStatus(current, {
      ...patch,
      now,
    });
    operations.set(requestId, next);
    options.onChange?.(next);
    return next;
  }

  function complete(
    requestId: string,
    patch: Omit<Parameters<typeof updateMapConfigSaveDeployStatus>[1], "phase">
  ): MapConfigSaveDeployStatus {
    return update(requestId, {
      ...patch,
      phase: "complete",
      saved: patch.saved ?? true,
      deployed: patch.deployed ?? true,
    });
  }

  function fail(
    requestId: string,
    phase: MapConfigSaveDeployPhase,
    failure: StudioRuntimeFailure,
    patch: SaveDeployFailurePatch = {}
  ): MapConfigSaveDeployStatus {
    const recoveryActions = [
      ...new Set([...recoveryActionsForSaveDeploy(phase), ...failure.recoveryActions]),
    ];
    return update(requestId, {
      ...patch,
      phase: "failed",
      error: failure.message,
      details: {
        ...(failure.diagnostics ?? {}),
        failureTag: failure.tag,
        reason: failure.reason,
        failedAtPhase: phase,
        recoveryActions,
      },
      recoveryActions,
    });
  }

  return {
    create,
    complete,
    fail,
    findActive,
    get,
    list,
    prune,
    update,
  };
}
