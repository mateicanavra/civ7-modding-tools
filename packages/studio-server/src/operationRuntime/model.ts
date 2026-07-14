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

export const OPERATION_TTL_MS = 30 * 60_000;

export type RuntimeOperationKind = "run-in-game" | "save-deploy" | "autoplay";

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

export type RuntimeTombstone = Readonly<{
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

export type RunInGameInternalOperation = Readonly<{
  kind: "run-in-game";
  requestId: string;
  leaseId: string;
  request: RunInGameRequestStatus;
  phase:
    | "accepted"
    | "materializing"
    | "deploying"
    | "checking-civ7"
    | "preparing-setup"
    | "starting-game"
    | "collecting-evidence"
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

export function statusForRunInGamePhase(
  phase: RunInGameInternalOperation["phase"]
): RunInGameInternalStatus {
  if (phase === "complete") return "complete";
  if (phase === "blocked") return "blocked";
  if (phase === "failed" || phase === "runtime-disposed") return "failed";
  if (phase === "uncertain") return "uncertain";
  if (phase === "cancelled") return "cancelled";
  return "running";
}

export function statusForSaveDeployPhase(
  phase: SaveDeployInternalOperation["phase"]
): MapConfigSaveDeployStatus["status"] {
  if (phase === "complete") return "complete";
  if (phase === "failed" || phase === "runtime-disposed") return "failed";
  return "running";
}

export function publicRunInGamePhase(phase: RunInGameInternalOperation["phase"]): RunInGamePhase {
  switch (phase) {
    case "accepted":
      return "admitting-config";
    case "materializing":
      return "generating-artifacts";
    case "deploying":
      return "deploying";
    case "checking-civ7":
    case "preparing-setup":
      return "preparing-civ7";
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

export function publicSaveDeployPhase(
  phase: SaveDeployInternalOperation["phase"]
): MapConfigSaveDeployStatus["phase"] {
  if (phase === "accepted") return "queued";
  if (phase === "runtime-disposed") return "failed";
  return phase;
}
