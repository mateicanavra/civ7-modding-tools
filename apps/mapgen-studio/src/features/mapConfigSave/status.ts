export const MAP_CONFIG_SAVE_DEPLOY_PHASES = [
  "idle",
  "queued",
  "saving",
  "deploying",
  "complete",
  "failed",
] as const;

export type MapConfigSaveDeployPhase = (typeof MAP_CONFIG_SAVE_DEPLOY_PHASES)[number];

export type MapConfigSaveDeployKind = "idle" | "running" | "complete" | "failed";

export type MapConfigSaveDeployStatus = Readonly<{
  ok: boolean;
  requestId: string;
  phase: MapConfigSaveDeployPhase;
  status: MapConfigSaveDeployKind;
  startedAt: string;
  updatedAt: string;
  path?: string;
  saved?: boolean;
  deployed?: boolean;
  error?: string;
  deploy?: {
    build?: {
      task?: string;
      stdout?: string;
      stderr?: string;
    };
    targetDir?: string;
    modsDir?: string;
    filesCopied?: number;
  };
  details?: Record<string, unknown>;
  recoveryActions?: ReadonlyArray<string>;
}>;

export function kindForMapConfigSaveDeployPhase(
  phase: MapConfigSaveDeployPhase,
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
  details?: Record<string, unknown>;
  recoveryActions?: ReadonlyArray<string>;
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
    ...(args.recoveryActions === undefined ? {} : { recoveryActions: args.recoveryActions }),
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
    details?: Record<string, unknown>;
    recoveryActions?: ReadonlyArray<string>;
  }>,
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
    ...(patch.recoveryActions === undefined ? {} : { recoveryActions: patch.recoveryActions }),
  };
}
