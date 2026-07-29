import type { InferContractRouterInputs, InferContractRouterOutputs } from "@orpc/contract";

import { advisorWarningRequest } from "./advisor-warning-request";
import { dismissRequest } from "./dismiss-request";
import { queue } from "./queue";

export const contract = {
  advisorWarning: {
    viewed: {
      request: advisorWarningRequest,
    },
  },
  dismiss: {
    request: dismissRequest,
  },
  queue,
};

export type Civ7NotificationsContract = typeof contract;
export type Civ7NotificationAdvisorWarningViewedInput = InferContractRouterInputs<
  typeof contract
>["advisorWarning"]["viewed"]["request"];
export type Civ7NotificationAdvisorWarningViewedResult = InferContractRouterOutputs<
  typeof contract
>["advisorWarning"]["viewed"]["request"];
export type Civ7NotificationQueueResult = InferContractRouterOutputs<
  typeof contract
>["queue"]["current"];
export type Civ7NotificationDismissalResult = InferContractRouterOutputs<
  typeof contract
>["dismiss"]["request"];
export type Civ7NotificationQueueDismissResult = InferContractRouterOutputs<
  typeof contract
>["queue"]["dismiss"]["request"];
