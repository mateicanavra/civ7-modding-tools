import { notificationsDismissRequestProcedure } from "./procedures/dismiss-request";
import { notificationsViewProcedure } from "./procedures/view";

export const notificationsRouter = {
  dismiss: {
    request: notificationsDismissRequestProcedure,
  },
  view: notificationsViewProcedure,
};
