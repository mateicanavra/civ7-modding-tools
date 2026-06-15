import type {
  RunInGameDeployment,
  RunInGamePreparedRequest,
  RunInGameRestartResult,
} from "./workflowTypes.js";

export type Civ7ProcessControl = Readonly<{
  restartCivForRunInGame?(args: Readonly<{
    requestId: string;
    prepared: RunInGamePreparedRequest;
    deployment: RunInGameDeployment;
  }>): Promise<RunInGameRestartResult>;
}>;
