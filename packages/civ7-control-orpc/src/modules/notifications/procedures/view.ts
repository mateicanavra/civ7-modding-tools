import { Effect } from "effect";

import { civ7ControlOrpcImplementer } from "../../../procedure";

export const notificationsViewProcedure =
  civ7ControlOrpcImplementer.notifications.view.effect(function* ({
    context,
    errors,
    input,
  }) {
    return yield* Effect.tryPromise({
      try: () =>
        context.directControl.getCiv7PlayNotificationView({
          ...context.endpointDefaults,
          ...input,
        }),
      catch: () =>
        errors.NOTIFICATION_VIEW_UNAVAILABLE({
          data: {
            procedureKey: "notifications.view",
            source: "direct-control-facade",
          },
        }),
    });
  });
