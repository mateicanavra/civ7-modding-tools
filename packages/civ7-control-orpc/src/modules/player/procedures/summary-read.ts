import { Effect } from "effect";

import { civ7ControlOrpcImplementer } from "../../../procedure";

export const playerSummaryReadProcedure =
  civ7ControlOrpcImplementer.player.summary.read.effect(function* ({
    context,
    errors,
    input,
  }) {
    return yield* Effect.tryPromise({
      try: () =>
        context.directControl.getCiv7PlayerSummary(
          input,
          context.endpointDefaults,
        ),
      catch: () =>
        errors.PLAYER_SUMMARY_UNAVAILABLE({
          data: {
            procedureKey: "player.summary.read",
            source: "direct-control-facade",
          },
        }),
    });
  });
