import type {
  RunInGameDeployment,
  RunInGameEvidence,
  RunInGameLogEvidence,
  RunInGamePreparedRequest,
  RunInGameRuntimeObservation,
  RunInGameSetupPrepared,
  RunInGameStarted,
} from "./workflowTypes.js";

export type EvidenceBuilder = Readonly<{
  buildRunInGameEvidence(
    args: Readonly<{
      requestId: string;
      prepared: RunInGamePreparedRequest;
      deployment: RunInGameDeployment;
      setup: RunInGameSetupPrepared;
      started: RunInGameStarted;
      log: RunInGameLogEvidence;
      observation: RunInGameRuntimeObservation;
    }>
  ): Promise<RunInGameEvidence>;
}>;
