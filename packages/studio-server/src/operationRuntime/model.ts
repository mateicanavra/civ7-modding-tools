import type {
  MapConfigSaveDeployStatus,
  RunInGameExactAuthorshipEvidence,
  RunInGameMaterializationStatus,
  RunInGamePhase,
  RunInGameRequestStatus,
} from "@civ7/studio-contract";
import type { StudioRunGenerationManifestReference } from "@civ7/studio-run-workspace";
import type { StudioRuntimeFailure } from "../errors/index.js";
import type {
  RunInGameDeploymentEvidence,
  RunInGameRuntimeObservation,
  StudioDaemonIdentity,
} from "./ports.js";

/** Retention window for terminal operations before lookup reports them as expired. */
export const OPERATION_TTL_MS = 30 * 60_000;

type RuntimeOperationKind = "run-in-game" | "save-deploy" | "autoplay";

export type RuntimeActiveSlot =
  | Readonly<{
      kind: "run-in-game";
      requestId: string;
      leaseId: string;
      phase: string;
      deploymentEvidence?: RunInGameDeploymentEvidence;
    }>
  | Readonly<{
      kind: "save-deploy" | "autoplay";
      requestId: string;
      leaseId: string;
      phase: string;
    }>;

type RuntimeTombstone = Readonly<{
  requestId: string;
  kind: Exclude<RuntimeOperationKind, "autoplay">;
  expiredAt: string;
  lastUpdatedAt: string;
}>;

export type RunInGameInternalStatus =
  | "running"
  | "complete"
  | "blocked"
  | "failed"
  | "uncertain"
  | "cancelled";

export type RunInGameFailurePhase =
  | "materializing"
  | "deploying"
  | "starting-game"
  | "collecting-evidence";

export type RunInGameInternalOperation = Readonly<{
  kind: "run-in-game";
  requestId: string;
  leaseId: string;
  request: RunInGameRequestStatus;
  phase:
    | "accepted"
    | RunInGameFailurePhase
    | "complete"
    | "blocked"
    | "failed"
    | "uncertain"
    | "cancelled"
    | "runtime-disposed";
  status: RunInGameInternalStatus;
  operationRevision: number;
  startedAt: string;
  updatedAt: string;
  diagnosticsId?: string;
  diagnosticsPersistedRevision?: number;
  generationManifest?: StudioRunGenerationManifestReference;
  completedPhases: readonly RunInGamePhase[];
  materialization?: RunInGameMaterializationStatus;
  deploymentEvidence?: RunInGameDeploymentEvidence;
  runtimeObservation?: RunInGameRuntimeObservation;
  exactAuthorshipEvidence?: RunInGameExactAuthorshipEvidence;
  result?: unknown;
  failure?: StudioRuntimeFailure;
  failedAtPhase?: RunInGameFailurePhase;
  cancellationCleanupFailure?: StudioRuntimeFailure;
}>;

export type SaveDeployInternalOperation = Readonly<{
  kind: "save-deploy";
  requestId: string;
  leaseId: string;
  phase:
    | "accepted"
    | "queued"
    | "saving"
    | "deploying"
    | "complete"
    | "failed"
    | "runtime-disposed";
  status: MapConfigSaveDeployStatus["status"];
  startedAt: string;
  updatedAt: string;
  path?: string;
  saved?: boolean;
  deployed?: boolean;
  deploy?: unknown;
  failure?: StudioRuntimeFailure;
  failedAtPhase?: "saving" | "deploying";
}>;

export type RegistryState = Readonly<{
  identity: StudioDaemonIdentity;
  disposed: boolean;
  active: RuntimeActiveSlot | null;
  runInGame: Readonly<Record<string, RunInGameInternalOperation>>;
  saveDeploy: Readonly<Record<string, SaveDeployInternalOperation>>;
  tombstones: Readonly<Record<string, RuntimeTombstone>>;
}>;

/** Creates an admission-open registry owned by one immutable daemon identity. */
export function emptyRegistry(identity: StudioDaemonIdentity): RegistryState {
  return {
    identity,
    disposed: false,
    active: null,
    runInGame: {},
    saveDeploy: {},
    tombstones: {},
  };
}

/** Maps an internal Run in Game phase to its coarse public lifecycle status. */
export function statusForRunInGamePhase(
  phase: RunInGameInternalOperation["phase"]
): RunInGameInternalStatus {
  switch (phase) {
    case "accepted":
    case "materializing":
    case "deploying":
    case "starting-game":
    case "collecting-evidence":
      return "running";
    case "complete":
      return "complete";
    case "blocked":
      return "blocked";
    case "failed":
    case "runtime-disposed":
      return "failed";
    case "uncertain":
      return "uncertain";
    case "cancelled":
      return "cancelled";
  }
  return unhandledPhase(phase);
}

/**
 * Returns whether Studio has handed lifecycle mutation authority to Civ7.
 * While one of these phases is running, cancellation or failure cannot prove
 * that replay is safe; observation must settle the outcome instead.
 */
export function runInGameLifecycleOwnsMutation(
  phase: RunInGameInternalOperation["phase"]
): boolean {
  return phase === "starting-game" || phase === "collecting-evidence";
}

/** Selects the terminal phase that accurately describes the failed workflow stage. */
export function failurePhaseForRunInGame(
  phase: RunInGameInternalOperation["phase"]
): RunInGameFailurePhase {
  switch (phase) {
    case "accepted":
    case "materializing":
      return "materializing";
    case "deploying":
    case "starting-game":
    case "collecting-evidence":
      return phase;
    case "complete":
    case "blocked":
    case "failed":
    case "uncertain":
    case "cancelled":
    case "runtime-disposed":
      throw new Error(`Terminal Run in Game phase cannot require failure routing: ${phase}`);
  }
}

/** Maps an internal save/deploy phase to its coarse public lifecycle status. */
export function statusForSaveDeployPhase(
  phase: SaveDeployInternalOperation["phase"]
): MapConfigSaveDeployStatus["status"] {
  switch (phase) {
    case "accepted":
    case "queued":
    case "saving":
    case "deploying":
      return "running";
    case "complete":
      return "complete";
    case "failed":
    case "runtime-disposed":
      return "failed";
  }
  return unhandledPhase(phase);
}

/** Removes internal-only Run in Game phases from the client-visible state machine. */
export function publicRunInGamePhase(phase: RunInGameInternalOperation["phase"]): RunInGamePhase {
  switch (phase) {
    case "accepted":
      return "admitting-config";
    case "materializing":
      return "generating-artifacts";
    case "deploying":
      return "deploying";
    case "starting-game":
      return "starting-game";
    case "collecting-evidence":
      return "observing-runtime";
    case "complete":
      return "completed";
    case "blocked":
    case "failed":
    case "uncertain":
    case "runtime-disposed":
      return "failed";
    case "cancelled":
      return "cancelled";
  }
}

/** Removes internal-only save/deploy phases from the client-visible state machine. */
export function publicSaveDeployPhase(
  phase: SaveDeployInternalOperation["phase"]
): MapConfigSaveDeployStatus["phase"] {
  if (phase === "accepted") return "queued";
  if (phase === "runtime-disposed") return "failed";
  return phase;
}

function unhandledPhase(phase: never): never {
  throw new Error(`Unhandled operation phase: ${String(phase)}`);
}
