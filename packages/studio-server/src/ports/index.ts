export type { Civ7ProcessControl } from "./Civ7ProcessControl.js";
export {
  Civ7WorkflowControl,
  type Civ7WorkflowControlApi,
  Civ7WorkflowControlLive,
} from "./Civ7WorkflowControl.js";
export type { DeployRunner } from "./DeployRunner.js";
export type { MapConfigStore } from "./MapConfigStore.js";
export type { ProofBuilder } from "./ProofBuilder.js";
export type { ScriptingLog } from "./ScriptingLog.js";
export type {
  RunInGameDeployment,
  RunInGameLogEvidence,
  RunInGameMaterialized,
  RunInGamePreparedRequest,
  RunInGameProof,
  RunInGameRestartResult,
  RunInGameSetupPrepared,
  RunInGameStarted,
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
import type { ScriptingLog } from "./ScriptingLog.js";
import type { StudioClock } from "./workflowTypes.js";

export type StudioWorkflowPorts = Readonly<{
  clock?: StudioClock;
  runInGameWorkspaceRoot?: string;
}> &
  ProofBuilder &
  DeployRunner &
  Civ7ProcessControl &
  ScriptingLog &
  MapConfigStore;
