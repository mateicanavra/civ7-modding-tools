export {
  Civ7WorkflowControl,
  type Civ7WorkflowControlApi,
  Civ7WorkflowControlLive,
} from "./Civ7WorkflowControl.js";
export type {
  CanonicalRunInGameRequest,
  RunInGameDeployment,
  RunInGameDeploymentEvidence,
  RunInGameGeneratedMod,
  RunInGameLogEvidence,
  RunInGamePreparedRequest,
  RunInGameRuntimeObservation,
  RunInGameStarted,
  SaveDeployPreparedRequest,
  SaveDeployRequest,
  SaveDeployRollback,
  StudioDaemonIdentity,
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
