import type { InferContractRouterInputs, InferContractRouterOutputs } from "@orpc/contract";

import { singlePlayerStart } from "./single-player-start";

export const contract = {
  singlePlayer: {
    start: singlePlayerStart,
  },
};

export type Civ7LifecycleSinglePlayerStartInput = InferContractRouterInputs<
  typeof contract
>["singlePlayer"]["start"];
export type Civ7LifecycleSinglePlayerStartResult = InferContractRouterOutputs<
  typeof contract
>["singlePlayer"]["start"];
