import type { InferContractRouterOutputs } from "@orpc/contract";

import { current } from "./current";

export const contract = {
  current,
};

export type Civ7ReadinessContract = typeof contract;
export type Civ7ReadinessCurrentResult = InferContractRouterOutputs<typeof contract>["current"];
