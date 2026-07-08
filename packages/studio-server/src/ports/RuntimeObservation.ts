import type {
  RunInGameDeployment,
  RunInGameLogEvidence,
  RunInGamePreparedRequest,
  RunInGameRuntimeObservation,
  RunInGameSetupPrepared,
  RunInGameStarted,
} from "./workflowTypes.js";

export type RuntimeObservation = Readonly<{
  observeRunInGameRuntime(
    args: Readonly<{
      requestId: string;
      prepared: RunInGamePreparedRequest;
      deployment: RunInGameDeployment;
      setup: RunInGameSetupPrepared;
      started: RunInGameStarted;
      log: RunInGameLogEvidence;
      signal?: AbortSignal;
    }>
  ): Promise<RunInGameRuntimeObservation>;
}>;
