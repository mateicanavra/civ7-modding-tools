import { Effect } from "effect";

import { Civ7DirectControlUnavailableError } from "../../../errors";
import { civ7ControlOrpcImplementer } from "../../../procedure";

export const runtimePlayableStatusProcedure =
  civ7ControlOrpcImplementer.runtime.playable.status.effect(function* ({
    context,
  }) {
    return yield* Effect.tryPromise({
      try: () =>
        context.directControl.getCiv7PlayableStatus(context.endpointDefaults),
      catch: () =>
        new Civ7DirectControlUnavailableError({
          data: {
            procedureKey: "runtime.playable.status",
            source: "direct-control-facade",
          },
        }),
    });
  });
