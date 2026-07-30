import type { InferContractRouterInputs, InferContractRouterOutputs } from "@orpc/contract";
import { completeRequest } from "./complete-request";
export const contract = {
  ...completeRequest,
};
type Inputs = InferContractRouterInputs<typeof contract>;
type Outputs = InferContractRouterOutputs<typeof contract>;
export type Civ7TurnCompletionResult = Outputs["complete"]["request"];
