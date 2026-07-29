import type { InferContractRouterInputs, InferContractRouterOutputs } from "@orpc/contract";

import { current } from "./current";
import { priorities } from "./priorities";

export const contract = {
  current,
  priorities,
};

export type Civ7AttentionCurrentInput = InferContractRouterInputs<typeof contract>["current"];
export type Civ7AttentionCurrentResult = InferContractRouterOutputs<typeof contract>["current"];
export type Civ7AttentionPrioritiesInput = InferContractRouterInputs<typeof contract>["priorities"];
export type Civ7AttentionPrioritiesResult = InferContractRouterOutputs<
  typeof contract
>["priorities"];
