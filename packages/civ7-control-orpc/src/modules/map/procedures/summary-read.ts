import { Effect } from "effect";

import { civ7ControlOrpcImplementer } from "../../../procedure";

export const mapSummaryReadProcedure =
  civ7ControlOrpcImplementer.map.summary.read.effect(function* ({
    context,
    errors,
    input,
  }) {
    return yield* Effect.tryPromise({
      try: () =>
        context.directControl.getCiv7MapSummary({
          ...context.endpointDefaults,
          ...input,
        }),
      catch: () =>
        errors.MAP_SUMMARY_UNAVAILABLE({
          data: {
            procedureKey: "map.summary.read",
            source: "direct-control-facade",
          },
        }),
    });
  });
