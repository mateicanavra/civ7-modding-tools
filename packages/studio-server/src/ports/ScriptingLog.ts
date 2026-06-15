import type {
  RunInGameDeployment,
  RunInGameLogEvidence,
  RunInGamePreparedRequest,
  RunInGameSetupPrepared,
  RunInGameStarted,
} from "./workflowTypes.js";

export type ScriptingLog = Readonly<{
  waitForRunInGameLogProof(
    args: Readonly<{
      requestId: string;
      prepared: RunInGamePreparedRequest;
      deployment: RunInGameDeployment;
      setup: RunInGameSetupPrepared;
      started: RunInGameStarted;
    }>
  ): Promise<RunInGameLogEvidence>;
}>;
