import { advisorWarningRequest } from "./advisor-warning-request";
import { dismiss } from "./dismiss";
import { queue } from "./queue";
export const router = {
  advisorWarning: {
    viewed: {
      request: advisorWarningRequest,
    },
  },
  dismiss,
  queue: {
    current: queue.notificationsQueueCurrentProcedure,
    dismiss: {
      request: queue.notificationsQueueDismissRequestProcedure,
    },
  },
};
