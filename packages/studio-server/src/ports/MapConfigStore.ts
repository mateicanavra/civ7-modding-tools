import type { StudioInputs } from "../context.js";
import type {
  SaveDeployPreparedRequest,
  SaveDeployRollback,
  SaveDeploySaved,
  WorkflowFailureDiagnosticsPort,
} from "./workflowTypes.js";

export type MapConfigStore = WorkflowFailureDiagnosticsPort &
  Readonly<{
    prepareSaveDeployStart(
      args: Readonly<{
        requestId: string;
        input: StudioInputs["mapConfigs"]["saveDeploy"];
      }>
    ): Promise<SaveDeployPreparedRequest>;
    saveMapConfig(
      args: Readonly<{
        requestId: string;
        input: StudioInputs["mapConfigs"]["saveDeploy"];
        prepared: SaveDeployPreparedRequest;
      }>
    ): Promise<SaveDeploySaved>;
    rollbackSaveDeploy(
      args: Readonly<{
        requestId: string;
        input: StudioInputs["mapConfigs"]["saveDeploy"];
        prepared: SaveDeployPreparedRequest;
        saved?: SaveDeploySaved;
        failedAtPhase: "saving" | "deploying";
        cause: unknown;
      }>
    ): Promise<SaveDeployRollback>;
  }>;
