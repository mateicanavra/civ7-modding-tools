import { notificationsDismissRequestProcedure } from "./procedures/dismiss-request";
import {
  notificationsQueueCurrentProcedure,
  notificationsQueueDismissRequestProcedure,
} from "./procedures/queue";

export const notificationsRouter = {
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
