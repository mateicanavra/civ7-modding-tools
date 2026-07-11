import type {
  SaveDeployPreparedRequest,
  SaveDeployRequest,
  SaveDeployRollback,
  SaveDeploySaved,
  WorkflowFailureDiagnosticsPort,
} from "./workflowTypes.js";

export type MapConfigStore = WorkflowFailureDiagnosticsPort &
  Readonly<{
    prepareSaveDeployStart(
      args: Readonly<{
        requestId: string;
        input: SaveDeployRequest;
      }>
    ): Promise<SaveDeployPreparedRequest>;
    saveMapConfig(
      args: Readonly<{
        requestId: string;
        input: SaveDeployRequest;
        prepared: SaveDeployPreparedRequest;
      }>
    ): Promise<SaveDeploySaved>;
    rollbackSaveDeploy(
      args: Readonly<{
        requestId: string;
        input: SaveDeployRequest;
        prepared: SaveDeployPreparedRequest;
        saved?: SaveDeploySaved;
        failedAtPhase: "saving" | "deploying";
        cause: unknown;
      }>
    ): Promise<SaveDeployRollback>;
  }>;
