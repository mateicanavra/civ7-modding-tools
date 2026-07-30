import type { InferContractRouterInputs, InferContractRouterOutputs } from "@orpc/contract";

import { celebrationChoice } from "./celebration-choice";
import { choice } from "./choice";

export const contract = {
  choice: {
    check: choice.check,
    request: choice.request,
  },
  celebration: {
    choice: {
      check: celebrationChoice.check,
      request: celebrationChoice.request,
    },
  },
};

export type Civ7GovernmentChoiceInput = InferContractRouterInputs<
  typeof contract
>["choice"]["check"];
export type Civ7GovernmentCelebrationChoiceInput = InferContractRouterInputs<
  typeof contract
>["celebration"]["choice"]["check"];
export type Civ7GovernmentChoiceCheckResult = InferContractRouterOutputs<
  typeof contract
>["choice"]["check"];
export type Civ7GovernmentCelebrationChoiceCheckResult = InferContractRouterOutputs<
  typeof contract
>["celebration"]["choice"]["check"];
export type Civ7GovernmentChoiceResult = InferContractRouterOutputs<
  typeof contract
>["choice"]["request"];
export type Civ7GovernmentCelebrationChoiceResult = InferContractRouterOutputs<
  typeof contract
>["celebration"]["choice"]["request"];
