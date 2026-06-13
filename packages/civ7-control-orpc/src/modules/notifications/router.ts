import { notificationsAdvisorWarningViewedRequestProcedure } from "./procedures/advisor-warning-request";
import { notificationsDismissRequestProcedure } from "./procedures/dismiss-request";
import {
  notificationsQueueCurrentProcedure,
  notificationsQueueDismissRequestProcedure,
} from "./procedures/queue";

export const notificationsRouter = {
  advisorWarning: {
    viewed: {
      request: notificationsAdvisorWarningViewedRequestProcedure,
    },
  },
  dismiss: {
    request: notificationsDismissRequestProcedure,
  },
  queue: {
    current: notificationsQueueCurrentProcedure,
    dismiss: {
      request: notificationsQueueDismissRequestProcedure,
    },
  },
};
