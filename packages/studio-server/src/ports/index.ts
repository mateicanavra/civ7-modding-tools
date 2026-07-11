export {
  Civ7WorkflowControl,
  type Civ7WorkflowControlApi,
  Civ7WorkflowControlLive,
} from "./Civ7WorkflowControl.js";
export type { DeployRunner } from "./DeployRunner.js";
export type { EvidenceBuilder } from "./EvidenceBuilder.js";
export type { MapConfigStore } from "./MapConfigStore.js";
export type { RunInGameArtifactGenerator } from "./RunInGameArtifactGenerator.js";
export type { RuntimeObservation } from "./RuntimeObservation.js";
export type { ScriptingLog } from "./ScriptingLog.js";
export type {
  CanonicalRunInGameRequest,
  DeployedModSnapshot,
  DeployedModSnapshotFile,
  LoadedGameReadback,
  RunDeployment,
  RunInGameCanonicalConfigAdmission,
  RunInGameDeployment,
  RunInGameDeploymentEvidence,
  RunInGameEvidence,
  RunInGameGeneratedMod,
  RunInGameLogEvidence,
  RunInGamePreparedRequest,
  RunInGameRuntimeObservation,
  RunInGameSetupPrepared,
  RunInGameStarted,
  SaveDeployDeployed,
  SaveDeployPreparedRequest,
  SaveDeployRequest,
  SaveDeployRollback,
  SaveDeploySaved,
  ScriptingLogObservation,
  SetupRowReadback,
  StudioClock,
  StudioDaemonIdentity,
  WorkflowFailureDiagnosticsPort,
  WorkflowInput,
  WorkflowOutput,
} from "./workflowTypes.js";

import type { DeployRunner } from "./DeployRunner.js";
import type { EvidenceBuilder } from "./EvidenceBuilder.js";
import type { MapConfigStore } from "./MapConfigStore.js";
import type { RunInGameArtifactGenerator } from "./RunInGameArtifactGenerator.js";
import type { RuntimeObservation } from "./RuntimeObservation.js";
import type { ScriptingLog } from "./ScriptingLog.js";
import type { RunInGameCanonicalConfigAdmission, StudioClock } from "./workflowTypes.js";

export type StudioWorkflowPorts = Readonly<{
  clock?: StudioClock;
  runInGameWorkspaceRoot?: string;
  runInGameCanonicalConfigAdmission?: RunInGameCanonicalConfigAdmission;
}> &
  EvidenceBuilder &
  RunInGameArtifactGenerator &
  DeployRunner &
  ScriptingLog &
  RuntimeObservation &
  MapConfigStore;
