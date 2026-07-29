import type { InferContractRouterInputs, InferContractRouterOutputs } from "@orpc/contract";

import { attribute } from "./attribute";
import { choice } from "./choice";
import { dashboardCurrent } from "./dashboard-current";
import { target } from "./target";
import { tradition } from "./tradition";
import { traditionsCurrent } from "./traditions-current";

export const contract = {
  dashboard: {
    current: dashboardCurrent,
  },
  traditions: {
    current: traditionsCurrent,
  },
  technology: {
    choice: choice.technology,
    target: target.technology,
  },
  culture: {
    choice: choice.culture,
    target: target.culture,
  },
  attribute,
  tradition,
};

type ContractInputs = InferContractRouterInputs<typeof contract>;
type ContractOutputs = InferContractRouterOutputs<typeof contract>;

export type Civ7ProgressionChoiceInput = ContractInputs["technology"]["choice"]["request"];
export type Civ7ProgressionChoiceOptionsResult = ContractOutputs["technology"]["choice"]["options"];
export type Civ7ProgressionChoiceCheckResult = ContractOutputs["technology"]["choice"]["check"];
export type Civ7ProgressionTargetInput = ContractInputs["technology"]["target"]["request"];
export type Civ7ProgressionTargetCheckResult = ContractOutputs["technology"]["target"]["check"];
export type Civ7ProgressionAttributePurchaseInput =
  ContractInputs["attribute"]["purchase"]["request"];
export type Civ7ProgressionAttributePurchaseCheckResult =
  ContractOutputs["attribute"]["purchase"]["check"];
export type Civ7ProgressionAttributeReviewCheckResult =
  ContractOutputs["attribute"]["review"]["check"];
export type Civ7ProgressionDashboardInput = ContractInputs["dashboard"]["current"];
export type Civ7ProgressionTraditionsInput = ContractInputs["traditions"]["current"];
export type Civ7ProgressionTraditionChangeInput = ContractInputs["tradition"]["change"]["request"];
export type Civ7ProgressionTraditionChangeCheckResult =
  ContractOutputs["tradition"]["change"]["check"];
export type Civ7ProgressionTraditionReviewCheckResult =
  ContractOutputs["tradition"]["review"]["check"];
export type Civ7ProgressionTechnologyChoiceResult =
  ContractOutputs["technology"]["choice"]["request"];
export type Civ7ProgressionCultureChoiceResult = ContractOutputs["culture"]["choice"]["request"];
export type Civ7ProgressionTechnologyTargetResult =
  ContractOutputs["technology"]["target"]["request"];
export type Civ7ProgressionCultureTargetResult = ContractOutputs["culture"]["target"]["request"];
export type Civ7ProgressionAttributePurchaseResult =
  ContractOutputs["attribute"]["purchase"]["request"];
export type Civ7ProgressionAttributeReviewResult =
  ContractOutputs["attribute"]["review"]["request"];
export type Civ7ProgressionTraditionChangeResult =
  ContractOutputs["tradition"]["change"]["request"];
export type Civ7ProgressionTraditionReviewResult =
  ContractOutputs["tradition"]["review"]["request"];
export type Civ7ProgressionDashboardResult = ContractOutputs["dashboard"]["current"];
export type Civ7ProgressionTraditionsResult = ContractOutputs["traditions"]["current"];
