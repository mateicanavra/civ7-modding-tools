import type { StudioInputs } from "../context.js";
import type {
  RunInGameDeployment,
  RunInGameMaterialized,
  RunInGamePreparedRequest,
  SaveDeployDeployed,
  SaveDeployPreparedRequest,
  SaveDeploySaved,
} from "./workflowTypes.js";

export type DeployRunner = Readonly<{
  deployRunInGame(args: Readonly<{
    requestId: string;
    prepared: RunInGamePreparedRequest;
    materialized: RunInGameMaterialized;
  }>): Promise<RunInGameDeployment>;
  deploySavedMapConfig(args: Readonly<{
    requestId: string;
    input: StudioInputs["mapConfigs"]["saveDeploy"];
    prepared: SaveDeployPreparedRequest;
    saved: SaveDeploySaved;
  }>): Promise<SaveDeployDeployed>;
}>;
