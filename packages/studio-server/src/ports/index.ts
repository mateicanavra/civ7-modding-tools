export type { Civ7ProcessControl } from "./Civ7ProcessControl.js";
export {
  Civ7WorkflowControl,
  type Civ7WorkflowControlApi,
  Civ7WorkflowControlLive,
} from "./Civ7WorkflowControl.js";
export type { DeployRunner } from "./DeployRunner.js";
export type { MapConfigStore } from "./MapConfigStore.js";
export type { ProofBuilder } from "./ProofBuilder.js";
export type { RunInGameArtifactGenerator } from "./RunInGameArtifactGenerator.js";
export type { ScriptingLog } from "./ScriptingLog.js";
export type {
  CanonicalRunInGameRequest,
  DeployedModSnapshot,
  DeployedModSnapshotFile,
  RunInGameCatalogSource,
  RunInGameDeployment,
  RunInGameDeploymentEvidence,
  RunInGameGeneratedMod,
  RunInGameLogEvidence,
  RunInGamePreparedRequest,
  RunInGameProof,
  RunInGameRestartResult,
  RunInGameSetupPrepared,
  RunInGameStarted,
  RunDeployment,
  SaveDeployDeployed,
  SaveDeployPreparedRequest,
  SaveDeployRollback,
  SaveDeploySaved,
  StudioClock,
  StudioDaemonIdentity,
  WorkflowFailureDiagnosticsPort,
  WorkflowInput,
  WorkflowOutput,
} from "./workflowTypes.js";

import type { Civ7ProcessControl } from "./Civ7ProcessControl.js";
import type { DeployRunner } from "./DeployRunner.js";
import type { MapConfigStore } from "./MapConfigStore.js";
import type { ProofBuilder } from "./ProofBuilder.js";
import type { RunInGameArtifactGenerator } from "./RunInGameArtifactGenerator.js";
import type { ScriptingLog } from "./ScriptingLog.js";
import type { RunInGameCatalogSource, StudioClock } from "./workflowTypes.js";

export type StudioWorkflowPorts = Readonly<{
  clock?: StudioClock;
  runInGameWorkspaceRoot?: string;
  readRunInGameCatalogSource?(
    args: Readonly<{ catalogSourceId: string }>
  ): Promise<RunInGameCatalogSource | undefined>;
}> &
  ProofBuilder &
  RunInGameArtifactGenerator &
  DeployRunner &
  Civ7ProcessControl &
  ScriptingLog &
  MapConfigStore;
