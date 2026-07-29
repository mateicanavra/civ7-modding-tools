import type { InferContractRouterInputs, InferContractRouterOutputs } from "@orpc/contract";

import { choiceRequest } from "./choice-request";
import { dashboardCurrent } from "./dashboard-current";
import { playerChoiceRequest } from "./player-choice-request";
import { targetRequest } from "./target-request";
import { traditionsCurrent } from "./traditions-current";

export const contract = {
  dashboard: {
    current: dashboardCurrent,
  },
  traditions: {
    current: traditionsCurrent,
  },
  technology: {
    choice: {
      request: choiceRequest.technology,
    },
    target: {
      request: targetRequest.technology,
    },
  },
  culture: {
    choice: {
      request: choiceRequest.culture,
    },
    target: {
      request: targetRequest.culture,
    },
  },
  attribute: {
    purchase: {
      request: playerChoiceRequest.attribute.purchase,
    },
    review: {
      request: playerChoiceRequest.attribute.review,
    },
  },
  tradition: {
    change: {
      request: playerChoiceRequest.tradition.change,
    },
    review: {
      request: playerChoiceRequest.tradition.review,
    },
  },
};

export type Civ7ProgressionContract = typeof contract;

type ContractInputs = InferContractRouterInputs<typeof contract>;
type ContractOutputs = InferContractRouterOutputs<typeof contract>;

export type Civ7ProgressionChoiceInput = ContractInputs["technology"]["choice"]["request"];
export type Civ7ProgressionTargetInput = ContractInputs["technology"]["target"]["request"];
export type Civ7ProgressionAttributePurchaseInput =
  ContractInputs["attribute"]["purchase"]["request"];
export type Civ7ProgressionPlayerReviewInput = ContractInputs["attribute"]["review"]["request"];
export type Civ7ProgressionDashboardInput = ContractInputs["dashboard"]["current"];
export type Civ7ProgressionTraditionsInput = ContractInputs["traditions"]["current"];
export type Civ7ProgressionTraditionChangeInput = ContractInputs["tradition"]["change"]["request"];
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
