import type {
  MapConfigSaveDeployKind,
  MapConfigSaveDeployPhase,
  MapConfigSaveDeployStatus,
  StudioRecoveryAction,
} from "@civ7/studio-server/contract";
import { MAP_CONFIG_SAVE_DEPLOY_PHASES } from "@civ7/studio-server/contract";

export { MAP_CONFIG_SAVE_DEPLOY_PHASES };

export function kindForMapConfigSaveDeployPhase(
  phase: MapConfigSaveDeployPhase
): MapConfigSaveDeployKind {
  if (phase === "idle") return "idle";
  if (phase === "complete") return "complete";
  if (phase === "failed") return "failed";
  return "running";
}

export function formatMapConfigSaveDeployPhaseLabel(phase: MapConfigSaveDeployPhase): string {
  switch (phase) {
    case "idle":
      return "Save";
    case "queued":
      return "Queued";
    case "saving":
      return "Saving";
    case "deploying":
      return "Deploying";
    case "complete":
      return "Saved";
    case "failed":
      return "Save Failed";
  }
}

export function createMapConfigSaveDeployStatus(args: {
  requestId: string;
  phase: MapConfigSaveDeployPhase;
  now?: () => Date;
  path?: string;
  saved?: boolean;
  deployed?: boolean;
  error?: string;
  deploy?: MapConfigSaveDeployStatus["deploy"];
  details?: MapConfigSaveDeployStatus["details"];
  recoveryActions?: ReadonlyArray<StudioRecoveryAction>;
}): MapConfigSaveDeployStatus {
  const timestamp = (args.now ?? (() => new Date()))().toISOString();
  const status = kindForMapConfigSaveDeployPhase(args.phase);
  return {
    ok: status !== "failed",
    requestId: args.requestId,
    phase: args.phase,
    status,
    startedAt: timestamp,
    updatedAt: timestamp,
    ...(args.path === undefined ? {} : { path: args.path }),
    ...(args.saved === undefined ? {} : { saved: args.saved }),
    ...(args.deployed === undefined ? {} : { deployed: args.deployed }),
    ...(args.error === undefined ? {} : { error: args.error }),
    ...(args.deploy === undefined ? {} : { deploy: args.deploy }),
    ...(args.details === undefined ? {} : { details: args.details }),
    ...(args.recoveryActions === undefined ? {} : { recoveryActions: [...args.recoveryActions] }),
  };
}

export function updateMapConfigSaveDeployStatus(
  current: MapConfigSaveDeployStatus,
  patch: Readonly<{
    phase: MapConfigSaveDeployPhase;
    now?: () => Date;
    path?: string;
    saved?: boolean;
    deployed?: boolean;
    error?: string;
    deploy?: MapConfigSaveDeployStatus["deploy"];
    details?: MapConfigSaveDeployStatus["details"];
    recoveryActions?: ReadonlyArray<StudioRecoveryAction>;
  }>
): MapConfigSaveDeployStatus {
  const status = kindForMapConfigSaveDeployPhase(patch.phase);
  return {
    ...current,
    ok: status !== "failed",
    phase: patch.phase,
    status,
    updatedAt: (patch.now ?? (() => new Date()))().toISOString(),
    ...(patch.path === undefined ? {} : { path: patch.path }),
    ...(patch.saved === undefined ? {} : { saved: patch.saved }),
    ...(patch.deployed === undefined ? {} : { deployed: patch.deployed }),
    ...(patch.error === undefined ? {} : { error: patch.error }),
    ...(patch.deploy === undefined ? {} : { deploy: patch.deploy }),
    ...(patch.details === undefined ? {} : { details: patch.details }),
    ...(patch.recoveryActions === undefined ? {} : { recoveryActions: [...patch.recoveryActions] }),
  };
}

/** A save/deploy operation is terminal once it is no longer `running`. */
export function isSaveDeployTerminal(status: MapConfigSaveDeployStatus): boolean {
  return status.status !== "running";
}

/**
 * Project a terminal save/deploy status into the `{ ok, ... }` result shape the
 * save handlers consume. `fallbackPath` is used when the status carries no path.
 */
export function saveDeployResultFromTerminalStatus(
  status: MapConfigSaveDeployStatus,
  fallbackPath?: string
):
  | {
      ok: true;
      path?: string;
      deploy?: MapConfigSaveDeployStatus["deploy"];
      saved?: boolean;
      deployed?: boolean;
    }
  | { ok: false; error: string; saved?: boolean; deployed?: boolean; path?: string } {
  const path = status.path ?? fallbackPath;
  if (!status.ok || status.status === "failed") {
    return {
      ok: false,
      error: status.error ?? "Save/deploy failed",
      saved: status.saved,
      deployed: status.deployed,
      path,
    };
  }
  return {
    ok: true,
    path,
    deploy: status.deploy,
    saved: status.saved,
    deployed: status.deployed,
  };
}
