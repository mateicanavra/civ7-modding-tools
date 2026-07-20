import type {
  RunInGameDeployment,
  RunInGameLogEvidence,
  RunInGamePreparedRequest,
  RunInGameRuntimeObservation,
  RunInGameStarted,
} from "./workflowTypes.js";

export type RuntimeObservation = Readonly<{
  observeRunInGameRuntime(
    args: Readonly<{
      requestId: string;
      prepared: RunInGamePreparedRequest;
      deployment: RunInGameDeployment;
      started: RunInGameStarted;
      log: RunInGameLogEvidence;
      signal?: AbortSignal;
    }>
  ): Promise<RunInGameRuntimeObservation>;
}>;
