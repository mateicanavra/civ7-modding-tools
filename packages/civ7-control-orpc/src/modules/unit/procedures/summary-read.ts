import { Effect } from "effect";

import { civ7ControlOrpcImplementer } from "../../../procedure";

export const unitSummaryReadProcedure =
  civ7ControlOrpcImplementer.unit.summary.read.effect(function* ({
    context,
    errors,
    input,
  }) {
    return yield* Effect.tryPromise({
      try: () =>
        context.directControl.getCiv7UnitSummary(
          input,
          context.endpointDefaults,
        ),
      catch: () =>
        errors.UNIT_SUMMARY_UNAVAILABLE({
          data: {
            procedureKey: "unit.summary.read",
            source: "direct-control-facade",
          },
        }),
    });
  });
