import type {
  MapConfigSaveDeployStatus,
  RunInGameExactAuthorshipProof,
  RunInGameMaterializationStatus,
  RunInGamePhase,
  RunInGameProcessRestartStatus,
  RunInGameRequestStatus,
} from "@civ7/studio-contract";
import type { StudioRuntimeFailure } from "../errors/index.js";
import type { StudioDaemonIdentity } from "./ports.js";

export const OPERATION_TTL_MS = 30 * 60_000;

export type RuntimeOperationKind = "run-in-game" | "save-deploy" | "autoplay";

export type RuntimeActiveSlot = Readonly<{
  kind: RuntimeOperationKind;
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
  correlationDigest: string;
  request: RunInGameRequestStatus;
  phase:
    | "accepted"
    | "materializing"
    | "deploying"
    | "restarting-civ"
    | "checking-civ7"
    | "reload-needed"
    | "preparing-setup"
    | "starting-game"
    | "waiting-for-proof"
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
  completedPhases: readonly RunInGamePhase[];
  materialization?: RunInGameMaterializationStatus;
  processRestart?: RunInGameProcessRestartStatus;
  exactAuthorshipProof?: RunInGameExactAuthorshipProof;
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
  deploy?: MapConfigSaveDeployStatus["deploy"];
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
      return "resolving-source";
    case "materializing":
      return "generating-artifacts";
    case "deploying":
      return "deploying";
    case "restarting-civ":
    case "checking-civ7":
    case "reload-needed":
    case "preparing-setup":
      return "preparing-civ7";
    case "starting-game":
      return "starting-game";
    case "waiting-for-proof":
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
