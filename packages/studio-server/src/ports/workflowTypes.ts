import type {
  MapConfigSaveDeployStatus,
  RunInGameExactAuthorshipProof,
  RunInGameMaterializationStatus,
  RunInGameProcessRestartStatus,
  RunInGameRequestStatus,
} from "@civ7/studio-contract";
import type { StudioInputs, StudioOutputs } from "../context.js";
import type { StudioBoundedDiagnostics } from "../errors/index.js";

export type StudioDaemonIdentity = Readonly<{
  serverInstanceId: string;
  serverStartedAt: string;
}>;

export type StudioClock = Readonly<{
  now(): Date;
}>;

export type RunInGamePreparedRequest = Readonly<{
  correlationDigest: string;
  request: RunInGameRequestStatus;
}>;

export type RunInGameMaterialized = Readonly<{
  materialization?: RunInGameMaterializationStatus;
  cleanup?(): Promise<void>;
}>;

export type RunInGameDeployment = Readonly<{
  materialization?: RunInGameMaterializationStatus;
  deploy?: unknown;
}>;

export type RunInGameRestartResult = Readonly<{
  processRestart?: RunInGameProcessRestartStatus;
}>;

export type RunInGameSetupPrepared = Readonly<{
  rowProof?: unknown;
  rowVisibility?: unknown;
  reloadRequired?: boolean;
}>;

export type RunInGameStarted = Readonly<{
  start?: unknown;
}>;

export type RunInGameLogEvidence = Readonly<{
  result?: unknown;
  materialization?: RunInGameMaterializationStatus;
  logMarkerProof?: unknown;
  logProof?: unknown;
}>;

export type RunInGameProof = Readonly<{
  result?: unknown;
  exactAuthorshipProof?: RunInGameExactAuthorshipProof;
  materialization?: RunInGameMaterializationStatus;
}>;

export type SaveDeployPreparedRequest = Readonly<{
  path?: string;
  cleanup?(): Promise<void>;
}>;

export type SaveDeploySaved = Readonly<{
  path?: string;
  saved?: boolean;
}>;

export type SaveDeployRollback = Readonly<{
  path?: string;
  restored?: boolean;
  deleted?: boolean;
}>;

export type SaveDeployDeployed = Readonly<{
  path?: string;
  saved?: boolean;
  deployed?: boolean;
  deploy?: MapConfigSaveDeployStatus["deploy"];
}>;

export type WorkflowFailureDiagnosticsPort = Readonly<{
  failureDiagnostics?(err: unknown): StudioBoundedDiagnostics | undefined;
}>;

export type WorkflowInput = StudioInputs;
export type WorkflowOutput = StudioOutputs;
