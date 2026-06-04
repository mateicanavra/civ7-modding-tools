import { Effect } from "effect";

import { Civ7ReadyUnitViewUnavailableError } from "../../../errors";
import { civ7ControlOrpcImplementer } from "../../../procedure";

export const unitReadyViewProcedure =
  civ7ControlOrpcImplementer.unit.ready.view.effect(function* ({
    context,
    input,
  }) {
    return yield* Effect.tryPromise({
      try: () =>
        context.directControl.getCiv7ReadyUnitView(
          input,
          context.endpointDefaults,
        ),
      catch: () =>
        new Civ7ReadyUnitViewUnavailableError({
          data: {
            procedureKey: "unit.ready.view",
            source: "direct-control-facade",
          },
        }),
    });
  });
