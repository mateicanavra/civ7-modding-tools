import type {
  LaunchEnvelope,
  LaunchEnvelopeDigest,
  LaunchSourceDigest,
  MapConfigSaveDeployStatus,
  ResolvedLaunchSource,
  RunInGameExactAuthorshipProof,
  RunInGameMaterializationStatus,
  RunInGameProcessRestartStatus,
  RunInGameSetupConfig,
  RunInGameSourceSnapshotProof,
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

export type CanonicalRunInGameRequest = Readonly<{
  recipeId: string;
  seed: number;
  mapSize: string;
  playerCount?: number;
  resources?: string;
  selectedConfigId: string;
  setupConfig: RunInGameSetupConfig;
  materializationMode: "durable" | "disposable";
  restartCivProcess?: boolean;
  fingerprint?: string;
  sourceSnapshot?: RunInGameSourceSnapshotProof;
  resolvedLaunchSource: ResolvedLaunchSource;
  launchEnvelope: LaunchEnvelope;
  launchSourceDigest: LaunchSourceDigest;
  launchEnvelopeDigest: LaunchEnvelopeDigest;
}>;

export type RunInGamePreparedRequest = Readonly<{
  correlationDigest: string;
  request: CanonicalRunInGameRequest;
  resolvedLaunchSource: ResolvedLaunchSource;
  launchEnvelope: LaunchEnvelope;
  launchSourceDigest: LaunchSourceDigest;
  launchEnvelopeDigest: LaunchEnvelopeDigest;
}>;

export type RunInGameCatalogSource = Readonly<{
  catalogSourceId: string;
  configPath: string;
  name: string;
  description: string;
  sortIndex: number;
  latitudeBounds?: unknown;
  config: Record<string, unknown>;
}>;

export type RunInGameGeneratedModMaterialization = RunInGameMaterializationStatus &
  Readonly<{
    mapScript: string;
    configHash: string;
    envelopeHash: string;
    generationManifestDigest: string;
    runArtifactId: string;
    generatedModRoot: string;
    generatedModFileCount: number;
    generatedModDigest: string;
    mapRowId: string;
  }>;

export type RunInGameGeneratedMod = Readonly<{
  materialization: RunInGameGeneratedModMaterialization;
  cleanup?(): Promise<void>;
}>;

export type RunDeployment = Readonly<{
  requestId: string;
  deployedModId: string;
  generatedModRoot: string;
  generatedModDigest: string;
  targetRoot: string;
  startedAt: string;
  completedAt: string;
  filesCopied: number;
}>;

export type DeployedModSnapshotFile = Readonly<{
  path: string;
  sha256: string;
  sizeBytes: number;
}>;

export type DeployedModSnapshot = Readonly<{
  requestId: string;
  deployedModId: string;
  targetRoot: string;
  observedAt: string;
  fileCount: number;
  digest: string;
  files: readonly DeployedModSnapshotFile[];
}>;

export type RunInGameDeploymentEvidence = Readonly<{
  runDeployment: RunDeployment;
  deployedSnapshot: DeployedModSnapshot;
}>;

export type RunInGameDeployment = RunInGameDeploymentEvidence &
  Readonly<{
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
