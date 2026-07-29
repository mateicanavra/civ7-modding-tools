import type { InferContractRouterInputs, InferContractRouterOutputs } from "@orpc/contract";

import { choice } from "./choice";

export const contract = {
  choice,
};

export type Civ7NarrativeContract = typeof contract;
export type Civ7NarrativeChoiceInput = InferContractRouterInputs<
  typeof contract
>["choice"]["check"];
export type Civ7NarrativeChoiceCheckResult = InferContractRouterOutputs<
  typeof contract
>["choice"]["check"];
export type Civ7NarrativeChoiceResult = InferContractRouterOutputs<
  typeof contract
>["choice"]["request"];
