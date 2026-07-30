import type { InferContractRouterInputs, InferContractRouterOutputs } from "@orpc/contract";

import { choiceRequest } from "./choice-request";

export const contract = {
  choice: {
    request: choiceRequest.government,
  },
  celebration: {
    choice: {
      request: choiceRequest.celebration,
    },
  },
};

export type Civ7GovernmentChoiceInput = InferContractRouterInputs<
  typeof contract
>["choice"]["request"];
export type Civ7GovernmentCelebrationChoiceInput = InferContractRouterInputs<
  typeof contract
>["celebration"]["choice"]["request"];
export type Civ7GovernmentChoiceResult = InferContractRouterOutputs<
  typeof contract
>["choice"]["request"];
export type Civ7GovernmentCelebrationChoiceResult = InferContractRouterOutputs<
  typeof contract
>["celebration"]["choice"]["request"];
