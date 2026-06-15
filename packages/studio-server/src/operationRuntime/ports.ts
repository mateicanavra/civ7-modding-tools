import type { StudioInputs, StudioOutputs } from "../context.js";
import type { MapConfigSaveDeployStatus } from "../contract/mapConfigs.js";
import type {
  RunInGameExactAuthorshipProof,
  RunInGameMaterializationStatus,
  RunInGameProcessRestartStatus,
  RunInGameRequestStatus,
} from "../contract/runInGame.js";
import type { StudioBoundedDiagnostics, StudioRuntimeFailure } from "../errors/index.js";

export type StudioDaemonIdentity = Readonly<{
  serverInstanceId: string;
  serverStartedAt: string;
}>;

export type StudioClock = Readonly<{
  now(): Date;
}>;

export type RunInGamePreparedRequest = Readonly<{
  fingerprint: string;
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

export type SaveDeployDeployed = Readonly<{
  path?: string;
  saved?: boolean;
  deployed?: boolean;
  deploy?: MapConfigSaveDeployStatus["deploy"];
}>;

export type StudioOperationRuntimePorts = Readonly<{
  clock?: StudioClock;

  materializeRunInGame(args: Readonly<{
    requestId: string;
    input: StudioInputs["runInGame"]["start"];
    prepared: RunInGamePreparedRequest;
  }>): Promise<RunInGameMaterialized>;
  deployRunInGame(args: Readonly<{
    requestId: string;
    prepared: RunInGamePreparedRequest;
    materialized: RunInGameMaterialized;
  }>): Promise<RunInGameDeployment>;
  restartCivForRunInGame?(args: Readonly<{
    requestId: string;
    prepared: RunInGamePreparedRequest;
    deployment: RunInGameDeployment;
  }>): Promise<RunInGameRestartResult>;
  checkCiv7ForRunInGame(args: Readonly<{
    requestId: string;
    prepared: RunInGamePreparedRequest;
    deployment: RunInGameDeployment;
  }>): Promise<void>;
  prepareSetupForRunInGame(args: Readonly<{
    requestId: string;
    prepared: RunInGamePreparedRequest;
    deployment: RunInGameDeployment;
  }>): Promise<RunInGameSetupPrepared>;
  startGameForRunInGame(args: Readonly<{
    requestId: string;
    prepared: RunInGamePreparedRequest;
    deployment: RunInGameDeployment;
    setup: RunInGameSetupPrepared;
  }>): Promise<RunInGameStarted>;
  waitForRunInGameProof(args: Readonly<{
    requestId: string;
    prepared: RunInGamePreparedRequest;
    deployment: RunInGameDeployment;
    setup: RunInGameSetupPrepared;
    started: RunInGameStarted;
  }>): Promise<RunInGameProof>;

  prepareSaveDeployStart(args: Readonly<{
    requestId: string;
    input: StudioInputs["mapConfigs"]["saveDeploy"];
  }>): Promise<SaveDeployPreparedRequest>;
  saveMapConfig(args: Readonly<{
    requestId: string;
    input: StudioInputs["mapConfigs"]["saveDeploy"];
    prepared: SaveDeployPreparedRequest;
  }>): Promise<SaveDeploySaved>;
  deploySavedMapConfig(args: Readonly<{
    requestId: string;
    input: StudioInputs["mapConfigs"]["saveDeploy"];
    prepared: SaveDeployPreparedRequest;
    saved: SaveDeploySaved;
  }>): Promise<SaveDeployDeployed>;

  runAutoplay(input: StudioInputs["civ7"]["autoplay"]): Promise<StudioOutputs["civ7"]["autoplay"]>;
  normalizeSaveDeployFailure?(args: Readonly<{
    err: unknown;
    phase: "saving" | "deploying";
  }>): StudioRuntimeFailure | undefined;
  failureDiagnostics?(err: unknown): StudioBoundedDiagnostics | undefined;
}>;
