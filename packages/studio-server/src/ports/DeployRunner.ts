import type {
  RunInGameDeployment,
  RunInGameGeneratedMod,
  RunInGamePreparedRequest,
  SaveDeployDeployed,
  SaveDeployPreparedRequest,
  SaveDeployRequest,
  SaveDeploySaved,
} from "./workflowTypes.js";

export type DeployRunner = Readonly<{
  deployRunInGame(
    args: Readonly<{
      requestId: string;
      prepared: RunInGamePreparedRequest;
      generatedMod: RunInGameGeneratedMod;
      signal: AbortSignal;
    }>
  ): Promise<RunInGameDeployment>;
  deploySavedMapConfig(
    args: Readonly<{
      requestId: string;
      input: SaveDeployRequest;
      prepared: SaveDeployPreparedRequest;
      saved: SaveDeploySaved;
    }>
  ): Promise<SaveDeployDeployed>;
}>;
