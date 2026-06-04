import { Effect } from "effect";

import { civ7ControlOrpcImplementer } from "../../../procedure";

export const citySummaryReadProcedure =
  civ7ControlOrpcImplementer.city.summary.read.effect(function* ({
    context,
    errors,
    input,
  }) {
    return yield* Effect.tryPromise({
      try: () =>
        context.directControl.getCiv7CitySummary(
          input,
          context.endpointDefaults,
        ),
      catch: () =>
        errors.CITY_SUMMARY_UNAVAILABLE({
          data: {
            procedureKey: "city.summary.read",
            source: "direct-control-facade",
          },
        }),
    });
  });
