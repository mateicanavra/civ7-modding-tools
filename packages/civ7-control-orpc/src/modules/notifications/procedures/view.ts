import { Effect } from "effect";

import { Civ7NotificationViewUnavailableError } from "../../../errors";
import { civ7ControlOrpcImplementer } from "../../../procedure";

export const notificationsViewProcedure =
  civ7ControlOrpcImplementer.notifications.view.effect(function* ({
    context,
    input,
  }) {
    return yield* Effect.tryPromise({
      try: () =>
        context.directControl.getCiv7PlayNotificationView({
          ...context.endpointDefaults,
          ...input,
        }),
      catch: () =>
        new Civ7NotificationViewUnavailableError({
          data: {
            procedureKey: "notifications.view",
            source: "direct-control-facade",
          },
        }),
    });
  });
