import { unitSummaryReadProcedure } from "./procedures/summary-read";
import { unitTargetActionRequestProcedure } from "./procedures/target-action-request";

export const unitRouter = {
  summary: {
    read: unitSummaryReadProcedure,
  },
  target: {
    action: {
      request: unitTargetActionRequestProcedure,
    },
  },
};
