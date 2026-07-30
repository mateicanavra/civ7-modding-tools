import type { InferContractRouterInputs, InferContractRouterOutputs } from "@orpc/contract";
import { command } from "./command";
import { targetAction } from "./target-action";
export const contract = {
  ...command,
  target: {
    action: targetAction,
  },
};
type Inputs = InferContractRouterInputs<typeof contract>;
type Outputs = InferContractRouterOutputs<typeof contract>;
export type Civ7UnitTargetAction = Exclude<
  Outputs["target"]["action"]["check"]["selectedAction"],
  null
>;
export type Civ7UnitTargetActionCheckResult = Outputs["target"]["action"]["check"];
export type Civ7UnitTargetActionInput = Inputs["target"]["action"]["check"];
export type Civ7UnitTargetActionResult = Outputs["target"]["action"]["request"];
export type Civ7UnitUpgradeInput = Inputs["upgrade"]["request"];
export type Civ7UnitResettleInput = Inputs["resettle"]["request"];
export type Civ7UnitUpgradeCheckResult = Outputs["upgrade"]["check"];
export type Civ7UnitResettleCheckResult = Outputs["resettle"]["check"];
export type Civ7UnitCommandResult = Outputs["upgrade"]["request"];
