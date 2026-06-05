import { unitReadyViewProcedure } from "./procedures/ready-view";
import { unitSummaryReadProcedure } from "./procedures/summary-read";
import { unitTargetActionRequestProcedure } from "./procedures/target-action-request";

export const unitRouter = {
  ready: {
    view: unitReadyViewProcedure,
  },
  summary: {
    read: unitSummaryReadProcedure,
  },
  target: {
    action: {
      request: unitTargetActionRequestProcedure,
    },
  },
};
