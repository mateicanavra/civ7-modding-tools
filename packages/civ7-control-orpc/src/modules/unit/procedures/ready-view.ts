import { Effect } from "effect";

import { civ7ControlOrpcImplementer } from "../../../procedure";

export const unitReadyViewProcedure =
  civ7ControlOrpcImplementer.unit.ready.view.effect(function* ({
    context,
    errors,
    input,
  }) {
    return yield* Effect.tryPromise({
      try: () =>
        context.directControl.getCiv7ReadyUnitView(
          input,
          context.endpointDefaults,
        ),
      catch: () =>
        errors.READY_UNIT_VIEW_UNAVAILABLE({
          data: {
            procedureKey: "unit.ready.view",
            source: "direct-control-facade",
          },
        }),
    });
  });
