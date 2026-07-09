import type { StudioInputs } from "../context.js";
import type {
  RunInGameDeployment,
  RunInGameLogEvidence,
  RunInGameMaterialized,
  RunInGamePreparedRequest,
  RunInGameProof,
  RunInGameSetupPrepared,
  RunInGameStarted,
} from "./workflowTypes.js";

export type ProofBuilder = Readonly<{
  materializeRunInGame(
    args: Readonly<{
      requestId: string;
      input: StudioInputs["runInGame"]["start"];
      prepared: RunInGamePreparedRequest;
    }>
  ): Promise<RunInGameMaterialized>;
  buildRunInGameProof(
    args: Readonly<{
      requestId: string;
      prepared: RunInGamePreparedRequest;
      deployment: RunInGameDeployment;
      setup: RunInGameSetupPrepared;
      started: RunInGameStarted;
      log: RunInGameLogEvidence;
    }>
  ): Promise<RunInGameProof>;
}>;
