import type {
  RunInGameDeployment,
  RunInGameLogEvidence,
  RunInGamePreparedRequest,
  RunInGameStarted,
} from "./workflowTypes.js";

export type ScriptingLog = Readonly<{
  waitForRunInGameLogEvidence(
    args: Readonly<{
      requestId: string;
      prepared: RunInGamePreparedRequest;
      deployment: RunInGameDeployment;
      started: RunInGameStarted;
    }>
  ): Promise<RunInGameLogEvidence>;
}>;
