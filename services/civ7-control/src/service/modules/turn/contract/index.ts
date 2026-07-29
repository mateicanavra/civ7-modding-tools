import type { InferContractRouterInputs, InferContractRouterOutputs } from "@orpc/contract";

import { complete } from "./complete";

export const contract = {
  complete,
};
type Inputs = InferContractRouterInputs<typeof contract>;
type Outputs = InferContractRouterOutputs<typeof contract>;

export type Civ7TurnCompletionInput = Inputs["complete"]["check"];
export type Civ7TurnCompletionCheckResult = Outputs["complete"]["check"];
export type Civ7TurnCompletionResult = Outputs["complete"]["request"];
