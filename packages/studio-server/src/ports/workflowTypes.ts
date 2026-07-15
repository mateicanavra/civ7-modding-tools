import type { Civ7LifecycleSinglePlayerStartResult } from "@civ7/control-orpc";
import type {
  Civ7LiveSnapshotOutput,
  Civ7LiveStatusOutput,
  LaunchEnvelope,
  LaunchEnvelopeDigest,
  MapConfigEnvelope,
  RunInGameExactAuthorshipEvidence,
  RunInGameMaterializationStatus,
  RunInGameSetupConfig,
} from "@civ7/studio-contract";
import type { RunCorrelation } from "@civ7/studio-run-workspace";
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
  setupConfig: RunInGameSetupConfig;
}>;

export type RunInGamePreparedRequest = Readonly<{
  request: CanonicalRunInGameRequest;
  launchEnvelope: LaunchEnvelope;
  canonicalConfigDigest: string;
  launchEnvelopeDigest: LaunchEnvelopeDigest;
}>;

export type RunInGameCanonicalConfigAdmission = Readonly<{
  /**
   * The host performs recipe semantic admission on Studio's frozen snapshot.
   * It must return that same object and must not default, migrate, or rebuild it.
   */
  admit(canonicalConfig: MapConfigEnvelope): Promise<MapConfigEnvelope>;
}>;

/** Frozen Save/Deploy input retained after the public wire DTO is admitted. */
export type SaveDeployRequest = Readonly<{
  requestId?: string;
  canonicalConfig: MapConfigEnvelope;
  restart?: boolean;
  verifyRestart?: boolean;
}>;

export type RunInGameGeneratedModMaterialization = RunInGameMaterializationStatus &
  Readonly<{
    mapScript: string;
    canonicalConfigDigest: string;
    launchEnvelopeDigest: string;
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

export type RunInGameStarted = Civ7LifecycleSinglePlayerStartResult;

export type RunInGameLogEvidence = Readonly<{
  result?: unknown;
  materialization?: RunInGameMaterializationStatus;
  logMarkerEvidence?: unknown;
  logEvidence?: unknown;
}>;

export type ScriptingLogObservation = Readonly<{
  requestId: string;
  correlation: RunCorrelation;
  logPath?: string;
  observedAt?: string;
  startOffset?: number;
  matchedMarkers: readonly string[];
  evidence?: unknown;
}>;

export type SetupRowReadback = Readonly<{
  requestId: string;
  correlation: RunCorrelation;
  state: "matched";
  mapScript: string;
  runArtifactId: string;
  deployedModId: string;
  mapRowFiles: readonly string[];
}>;

export type LoadedGameReadback = Readonly<{
  requestId: string;
  correlation: RunCorrelation;
  marker: unknown;
  liveStatus: Civ7LiveStatusOutput;
  liveSnapshot: Civ7LiveSnapshotOutput;
  snapshotId?: string;
  snapshotHash?: string;
  dimensions: Readonly<{ width: number; height: number }>;
  deployedModId: string;
  deployedSnapshotDigest: string;
}>;

export type RunInGameRuntimeObservation = Readonly<{
  requestId: string;
  correlation: RunCorrelation;
  deploymentEvidence: RunInGameDeploymentEvidence;
  scriptingLog: ScriptingLogObservation;
  setupRow: SetupRowReadback;
  loadedGame: LoadedGameReadback;
}>;

export type RunInGameEvidence = Readonly<{
  result?: unknown;
  exactAuthorshipEvidence?: RunInGameExactAuthorshipEvidence;
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
  deploy?: unknown;
}>;

export type WorkflowFailureDiagnosticsPort = Readonly<{
  failureDiagnostics?(err: unknown): StudioBoundedDiagnostics | undefined;
}>;

export type WorkflowInput = StudioInputs;
export type WorkflowOutput = StudioOutputs;
