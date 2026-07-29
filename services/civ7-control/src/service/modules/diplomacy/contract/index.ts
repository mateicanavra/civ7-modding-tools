import type { InferContractRouterInputs, InferContractRouterOutputs } from "@orpc/contract";

import { firstMeetResponseRequest } from "./first-meet-response-request";
import { responseRequest } from "./response-request";

export const contract = {
  firstMeet: {
    response: {
      request: firstMeetResponseRequest,
    },
  },
  response: {
    request: responseRequest,
  },
};

export type Civ7DiplomacyResponseInput = InferContractRouterInputs<
  typeof contract
>["response"]["request"];
export type Civ7DiplomacyResponseResult = InferContractRouterOutputs<
  typeof contract
>["response"]["request"];
export type Civ7FirstMeetResponseInput = InferContractRouterInputs<
  typeof contract
>["firstMeet"]["response"]["request"];
export type Civ7FirstMeetResponseResult = InferContractRouterOutputs<
  typeof contract
>["firstMeet"]["response"]["request"];
