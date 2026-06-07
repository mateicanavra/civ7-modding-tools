export const RUN_IN_GAME_PHASES = [
  "idle",
  "materializing",
  "deploying",
  "restarting-civ",
  "checking-civ7",
  "reload-needed",
  "preparing-setup",
  "starting-game",
  "waiting-for-proof",
  "complete",
  "blocked",
  "failed",
  "uncertain",
] as const;

export type RunInGamePhase = (typeof RUN_IN_GAME_PHASES)[number];

export type RunInGameOperationKind = "idle" | "running" | "complete" | "blocked" | "failed" | "uncertain";

export type RunInGameMaterializationStatus = Readonly<{
  mode?: string;
  path?: string;
  mapScript?: string;
  configHash?: string;
  envelopeHash?: string;
  sourceConfig?: RunInGameFileIdentity;
  generatedSourceScript?: RunInGameFileIdentity;
  localModScript?: RunInGameFileIdentity;
  deployedModScript?: RunInGameFileIdentity;
}>;

export type RunInGameFileIdentity = Readonly<{
  path: string;
  sha256: string;
  sizeBytes: number;
  mtimeMs: number;
  mtimeIso: string;
}>;

export type RunInGameSourceSnapshotProof = Readonly<{
  identityHash: string;
  requestId: string;
  recipeSettings?: unknown;
  worldSettings?: unknown;
  pipelineConfig?: unknown;
  setupConfig?: unknown;
  materializationMode?: string;
  selectedConfig?: unknown;
  configHash?: string;
  envelopeHash?: string;
}>;

export type RunInGameResourcePlacementRejectionRow = Readonly<{
  status: "rejected" | "mismatch";
  resourceType: number;
  resource?: string;
  plotIndex: number;
  x: number;
  y: number;
  reason?: string;
  observedResourceType?: number;
  observedResource?: string;
  assignmentPhase?: string;
  assignmentOrder?: number;
  initialResourceType?: number;
  preferredResourceType?: number | null;
  perTypeCountBefore?: number;
  legalPlotCountForResource?: number;
  targetMinPerType?: number;
}>;

export type RunInGameNaturalWonderPlacementCoordinateRow = Readonly<{
  status: "placed" | "rejected";
  featureType: number;
  plotIndex: number;
  x: number;
  y: number;
  direction: number;
  elevation?: number;
  reason: string;
  observedFeatureType?: number;
  observedPlotIndex?: number;
  expectedFootprintReadback?: ReadonlyArray<Readonly<{
    plotIndex: number;
    observedFeatureType: number;
  }>>;
  expectedFootprintReadbackStatus?: "empty-expected-footprint" | "partial-expected-footprint";
}>;

export type RunInGameRequestStatus = Readonly<{
  recipeId?: string;
  seed?: number;
  mapSize?: string;
  playerCount?: number;
  resources?: string;
  selectedConfigId?: string;
  setupConfig?: unknown;
  setupConfigSource?: string;
  materializationMode?: string;
  restartCivProcess?: boolean;
  fingerprint?: string;
  sourceSnapshot?: RunInGameSourceSnapshotProof;
}>;

export type RunInGameProcessRestartStatus = Readonly<{
  command?: string;
  launchAttempts?: unknown;
  [key: string]: unknown;
}>;

export type RunInGameFailureDetails = Readonly<{
  failureClass?: string;
  code?: string;
  phase?: RunInGamePhase;
  mapScript?: string;
  materialization?: RunInGameMaterializationStatus;
  reloadRequired?: boolean;
  reloadBoundary?: string;
  reloadAttempted?: boolean;
  dismissNotificationRequired?: boolean;
  recoveryBoundary?: string;
  recoveryHint?: string;
  completedPhases?: ReadonlyArray<RunInGamePhase>;
  directControlCode?: string;
  cause?: unknown;
  [key: string]: unknown;
}>;

export type RunInGameExactAuthorshipProof = Readonly<{
  status: "complete" | "unresolved";
  requestId: string;
  createdAt: string;
  sourceSnapshot?: RunInGameSourceSnapshotProof;
  request: Readonly<{
    recipeId?: string;
    seed?: number;
    mapSize?: string;
    playerCount?: number;
    resources?: string;
    selectedConfigId?: string;
    setupConfigSource?: string;
    fingerprint?: string;
  }>;
  materialization: Readonly<{
    mode?: string;
    path?: string;
    mapScript?: string;
    configHash?: string;
    envelopeHash?: string;
    sourceConfig?: RunInGameFileIdentity;
    generatedSourceScript?: RunInGameFileIdentity;
    localModScript?: RunInGameFileIdentity;
    deployedModScript?: RunInGameFileIdentity;
  }>;
  civSetup: Readonly<{
    mapScript?: string;
    mapSize?: unknown;
    mapSeed?: unknown;
    gameSeed?: unknown;
    playerCount?: unknown;
    rowCount?: number;
  }>;
  runtime: Readonly<{
    seed?: number;
    width?: number;
    height?: number;
    plotCount?: number;
    turn?: number;
    gameHash?: number;
    sourceSnapshotId?: string;
    snapshotHash?: string;
  }>;
  log?: Readonly<{
    logPath?: string;
    observedAt?: string;
    requestId: string;
    configHash: string;
    envelopeHash: string;
    seed: number;
    mapSize?: string;
    dimensions: Readonly<{ width: number; height: number }>;
    proofPayload: unknown;
    completionPayload: unknown;
    featureApply?: Readonly<{
      marker: "FEATURE_APPLY_V1";
      payload: unknown;
      stats?: Readonly<{
        attempted: number;
        applied: number;
        rejected: number;
        rejectedCanHaveFeature: number;
        attemptedByFeature?: Readonly<Record<string, number>>;
        appliedByFeature?: Readonly<Record<string, number>>;
        rejectedCanHaveFeatureByFeature?: Readonly<Record<string, number>>;
      }>;
    }>;
    resourcePlacement?: Readonly<{
      marker: "RESOURCE_PLACEMENT_V1";
      payload: unknown;
      stats?: Readonly<{
        version: number;
        plannedCount: number;
        placedCount: number;
        rejectedCount: number;
        mismatchCount: number;
        rejectionExampleCount?: number;
        rejectionExamples?: ReadonlyArray<string>;
        rejectionRows?: ReadonlyArray<RunInGameResourcePlacementRejectionRow>;
      }>;
      coordinateProof?: Readonly<{
        version: number;
        placed: Readonly<{ count: number; hash32: string }>;
        rejected?: Readonly<{ count: number; hash32: string }>;
        mismatch?: Readonly<{ count: number; hash32: string }>;
      }>;
    }>;
    naturalWonderPlacement?: Readonly<{
      marker: "NATURAL_WONDER_PLACEMENT_V1";
      payload: unknown;
      stats?: Readonly<{
        version: number;
        plannedCount: number;
        targetCount: number;
        placedCount: number;
        terrainAdjustedCount: number;
        skippedOutOfBoundsCount: number;
        rejectedCount: number;
        shortfallCount: number;
        rejectionExampleCount?: number;
        rejectionExamples?: ReadonlyArray<string>;
      }>;
      coordinateProof?: Readonly<{
        version: number;
        placed: Readonly<{ count: number; hash32: string }>;
        rejected?: Readonly<{ count: number; hash32: string }>;
      }>;
      coordinateRows?: ReadonlyArray<RunInGameNaturalWonderPlacementCoordinateRow>;
    }>;
    matched: ReadonlyArray<string>;
  }>;
  unresolvedLinks: ReadonlyArray<string>;
}>;

export type RunInGameOperationStatus = Readonly<{
  ok: boolean;
  requestId: string;
  phase: RunInGamePhase;
  status: RunInGameOperationKind;
  startedAt: string;
  updatedAt: string;
  serverInstanceId?: string;
  serverStartedAt?: string;
  completedPhases: ReadonlyArray<RunInGamePhase>;
  request?: RunInGameRequestStatus;
  materialization?: RunInGameMaterializationStatus;
  processRestart?: RunInGameProcessRestartStatus;
  exactAuthorshipProof?: RunInGameExactAuthorshipProof;
  error?: string;
  details?: RunInGameFailureDetails;
  result?: unknown;
  recoveryActions?: ReadonlyArray<string>;
}>;

const TERMINAL_PHASES = new Set<RunInGamePhase>(["complete", "blocked", "failed", "uncertain"]);

const RUNNING_PHASES = new Set<RunInGamePhase>([
  "materializing",
  "deploying",
  "restarting-civ",
  "checking-civ7",
  "reload-needed",
  "preparing-setup",
  "starting-game",
  "waiting-for-proof",
]);

export function isRunInGameTerminalPhase(phase: RunInGamePhase): boolean {
  return TERMINAL_PHASES.has(phase);
}

export function kindForRunInGamePhase(phase: RunInGamePhase): RunInGameOperationKind {
  if (phase === "idle") return "idle";
  if (phase === "complete") return "complete";
  if (phase === "blocked") return "blocked";
  if (phase === "failed") return "failed";
  if (phase === "uncertain") return "uncertain";
  return RUNNING_PHASES.has(phase) ? "running" : "running";
}

export function formatRunInGamePhaseLabel(phase: RunInGamePhase): string {
  switch (phase) {
    case "idle":
      return "Run in Game";
    case "materializing":
      return "Materializing";
    case "deploying":
      return "Deploying";
    case "restarting-civ":
      return "Restarting Civ";
    case "checking-civ7":
      return "Checking Civ7";
    case "reload-needed":
      return "Reload Needed";
    case "preparing-setup":
      return "Preparing Setup";
    case "starting-game":
      return "Starting Game";
    case "waiting-for-proof":
      return "Waiting for Proof";
    case "complete":
      return "Complete";
    case "blocked":
      return "Blocked";
    case "failed":
      return "Failed";
    case "uncertain":
      return "Uncertain";
  }
}

export function runInGameCanRetryStatus(status?: RunInGameOperationStatus | null): boolean {
  if (!status) return false;
  return status.status === "running" || status.status === "blocked" || status.status === "failed" || status.status === "uncertain";
}

export function runInGameRequiresProcessRestart(status?: RunInGameOperationStatus | null): boolean {
  return status?.details?.reloadBoundary === "process-restart-required";
}

export function runInGamePrimaryActionLabel(
  status?: RunInGameOperationStatus | null,
  relation: "current" | "stale" | "unknown" = "unknown",
): string {
  if (status?.status === "running") return formatRunInGamePhaseLabel(status.phase);
  if (status && runInGameRequiresProcessRestart(status)) return "Restart Civ & Run";
  if (status?.status === "failed" || status?.status === "blocked" || status?.status === "uncertain") {
    return relation === "stale" ? "Run Current" : "Retry Run";
  }
  return "Run in Game";
}

export function formatRunInGameDiagnostics(status: RunInGameOperationStatus): string {
  return stableRunInGameStringify({
    requestId: status.requestId,
    phase: status.phase,
    status: status.status,
    startedAt: status.startedAt,
    updatedAt: status.updatedAt,
    serverInstanceId: status.serverInstanceId,
    serverStartedAt: status.serverStartedAt,
    completedPhases: status.completedPhases,
    request: status.request,
    materialization: status.materialization,
    processRestart: status.processRestart,
    exactAuthorshipProof: status.exactAuthorshipProof,
    error: status.error,
    details: status.details,
  });
}

export function stableRunInGameStringify(value: unknown): string {
  return JSON.stringify(canonicalize(value), null, 2);
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      out[key] = canonicalize((value as Record<string, unknown>)[key]);
    }
    return out;
  }
  return value;
}
