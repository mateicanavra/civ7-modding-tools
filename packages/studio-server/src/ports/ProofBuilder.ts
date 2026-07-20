import type {
  RunInGameDeployment,
  RunInGameLogEvidence,
  RunInGamePreparedRequest,
  RunInGameProof,
  RunInGameRuntimeObservation,
  RunInGameSetupPrepared,
  RunInGameStarted,
} from "./workflowTypes.js";

export type ProofBuilder = Readonly<{
  buildRunInGameProof(
    args: Readonly<{
      requestId: string;
      prepared: RunInGamePreparedRequest;
      deployment: RunInGameDeployment;
      setup: RunInGameSetupPrepared;
      started: RunInGameStarted;
      log: RunInGameLogEvidence;
      observation: RunInGameRuntimeObservation;
    }>
  ): Promise<RunInGameProof>;
}>;
