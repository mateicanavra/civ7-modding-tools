import type { InferContractRouterOutputs } from "@orpc/contract";

import { exploreRequest } from "./explore-request";
import { queue } from "./queue";

export const contract = {
  queue,
  explore: {
    request: exploreRequest,
  },
};

export type Civ7DisplayQueueCurrentResult = InferContractRouterOutputs<
  typeof contract
>["queue"]["current"];
export type Civ7DisplayQueueCloseResult = InferContractRouterOutputs<
  typeof contract
>["queue"]["close"];
export type Civ7DisplayExploreRequestResult = InferContractRouterOutputs<
  typeof contract
>["explore"]["request"];
