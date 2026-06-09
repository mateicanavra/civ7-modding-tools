import { notificationsDismissRequestProcedure } from "./procedures/dismiss-request";

export const notificationsRouter = {
  dismiss: {
    request: notificationsDismissRequestProcedure,
  },
};
