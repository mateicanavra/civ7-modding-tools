import { advisorWarningViewed } from "./advisor-warning-request";
import { dismiss } from "./dismiss";
import { queue } from "./queue";
export const router = {
  advisorWarning: {
    viewed: advisorWarningViewed,
  },
  dismiss,
  queue: {
    current: queue.notificationsQueueCurrentProcedure,
    dismiss: {
      request: queue.notificationsQueueDismissRequestProcedure,
    },
  },
};
