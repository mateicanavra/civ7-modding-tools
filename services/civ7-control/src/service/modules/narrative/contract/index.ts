import type { InferContractRouterInputs, InferContractRouterOutputs } from "@orpc/contract";

import { choiceRequest } from "./choice-request";

export const contract = {
  choice: {
    request: choiceRequest,
  },
};

export type Civ7NarrativeContract = typeof contract;
export type Civ7NarrativeChoiceInput = InferContractRouterInputs<
  typeof contract
>["choice"]["request"];
export type Civ7NarrativeChoiceResult = InferContractRouterOutputs<
  typeof contract
>["choice"]["request"];
