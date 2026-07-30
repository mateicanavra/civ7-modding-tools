import type { InferContractRouterInputs, InferContractRouterOutputs } from "@orpc/contract";
import { commandRequest } from "./command-request";
import { targetActionRequest } from "./target-action-request";
export const contract = {
  ...commandRequest,
  ...targetActionRequest,
};
type Inputs = InferContractRouterInputs<typeof contract>;
type Outputs = InferContractRouterOutputs<typeof contract>;
export type Civ7UnitTargetActionResult = Outputs["target"]["action"]["request"];
export type Civ7UnitUpgradeInput = Inputs["upgrade"]["request"];
export type Civ7UnitResettleInput = Inputs["resettle"]["request"];
export type Civ7UnitCommandResult = Outputs["upgrade"]["request"];
