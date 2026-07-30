import { advisorWarningRequest } from "./advisor-warning-request";
import { dismissRequest } from "./dismiss-request";
import { queue } from "./queue";
export const router = {
  advisorWarning: {
    viewed: {
      request: advisorWarningRequest,
    },
  },
  dismiss: {
    request: dismissRequest,
  },
  queue: {
    current: queue.notificationsQueueCurrentProcedure,
    dismiss: {
      request: queue.notificationsQueueDismissRequestProcedure,
    },
  },
};
