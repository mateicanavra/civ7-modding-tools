import type { InferContractRouterInputs, InferContractRouterOutputs } from "@orpc/contract";

import { advisorWarningViewed } from "./advisor-warning-viewed";
import { dismiss } from "./dismiss";
import { queue } from "./queue";

export const contract = {
  advisorWarning: {
    viewed: advisorWarningViewed,
  },
  dismiss,
  queue,
};

export type Civ7NotificationsContract = typeof contract;
type Inputs = InferContractRouterInputs<typeof contract>;
type Outputs = InferContractRouterOutputs<typeof contract>;
export type Civ7NotificationAdvisorWarningViewedInput = InferContractRouterInputs<
  typeof contract
>["advisorWarning"]["viewed"]["request"];
export type Civ7NotificationAdvisorWarningViewedCheckResult = InferContractRouterOutputs<
  typeof contract
>["advisorWarning"]["viewed"]["check"];
export type Civ7NotificationAdvisorWarningViewedResult = InferContractRouterOutputs<
  typeof contract
>["advisorWarning"]["viewed"]["request"];
export type Civ7NotificationDismissalInput = Inputs["dismiss"]["check"];
export type Civ7NotificationDismissalCheckResult = Outputs["dismiss"]["check"];
export type Civ7NotificationDismissalResult = Outputs["dismiss"]["request"];
export type Civ7NotificationQueueResult = Outputs["queue"]["current"];
export type Civ7NotificationQueueDismissResult = Outputs["queue"]["dismiss"]["request"];
