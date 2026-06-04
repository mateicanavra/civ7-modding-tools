import { Effect } from "effect";

import { civ7ControlOrpcImplementer } from "../../../procedure";

export const cityReadyViewProcedure =
  civ7ControlOrpcImplementer.city.ready.view.effect(function* ({
    context,
    errors,
    input,
  }) {
    return yield* Effect.tryPromise({
      try: () =>
        context.directControl.getCiv7ReadyCityView(
          input,
          context.endpointDefaults,
        ),
      catch: () =>
        errors.READY_CITY_VIEW_UNAVAILABLE({
          data: {
            procedureKey: "city.ready.view",
            source: "direct-control-facade",
          },
        }),
    });
  });
