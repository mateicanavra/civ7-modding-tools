import { Effect } from "effect";

import { civ7ControlOrpcImplementer } from "../../../procedure";

export const runtimePlayableStatusProcedure =
  civ7ControlOrpcImplementer.runtime.playable.status.effect(function* ({
    context,
    errors,
  }) {
    return yield* Effect.tryPromise({
      try: () =>
        context.directControl.getCiv7PlayableStatus(context.endpointDefaults),
      catch: () =>
        errors.DIRECT_CONTROL_UNAVAILABLE({
          data: {
            procedureKey: "runtime.playable.status",
            source: "direct-control-facade",
          },
        }),
    });
  });
