import type { MapConfigSaveDeployStatus } from "../contract/mapConfigs.js";
import type {
  RunInGameExactAuthorshipProof,
  RunInGameMaterializationStatus,
  RunInGameOperationKind,
  RunInGamePhase,
  RunInGameProcessRestartStatus,
  RunInGameRequestStatus,
} from "../contract/runInGame.js";
import type { StudioRuntimeFailure } from "../errors/index.js";
import type { StudioDaemonIdentity } from "./ports.js";

export const OPERATION_TTL_MS = 30 * 60_000;

export type RuntimeOperationKind = "run-in-game" | "save-deploy" | "autoplay";

export type RuntimeActiveSlot = Readonly<{
  kind: RuntimeOperationKind;
  requestId: string;
  phase: string;
}>;

export type RuntimeTombstone = Readonly<{
  requestId: string;
  kind: Exclude<RuntimeOperationKind, "autoplay">;
  fingerprint?: string;
  expiredAt: string;
  lastUpdatedAt: string;
}>;

export type RunInGameInternalOperation = Readonly<{
  kind: "run-in-game";
  requestId: string;
  fingerprint: string;
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
    | "runtime-disposed";
  status: RunInGameOperationKind;
  startedAt: string;
  updatedAt: string;
  completedPhases: readonly RunInGamePhase[];
  materialization?: RunInGameMaterializationStatus;
  processRestart?: RunInGameProcessRestartStatus;
  exactAuthorshipProof?: RunInGameExactAuthorshipProof;
  result?: unknown;
  failure?: StudioRuntimeFailure;
}>;

export type SaveDeployInternalOperation = Readonly<{
  kind: "save-deploy";
  requestId: string;
  phase: "accepted" | "queued" | "saving" | "deploying" | "complete" | "failed" | "runtime-disposed";
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

export function statusForRunInGamePhase(phase: RunInGameInternalOperation["phase"]): RunInGameOperationKind {
  if (phase === "complete") return "complete";
  if (phase === "blocked") return "blocked";
  if (phase === "failed" || phase === "runtime-disposed") return "failed";
  if (phase === "uncertain") return "uncertain";
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
  if (phase === "accepted") return "materializing";
  if (phase === "runtime-disposed") return "failed";
  return phase;
}

export function publicSaveDeployPhase(
  phase: SaveDeployInternalOperation["phase"]
): MapConfigSaveDeployStatus["phase"] {
  if (phase === "accepted") return "queued";
  if (phase === "runtime-disposed") return "failed";
  return phase;
}
