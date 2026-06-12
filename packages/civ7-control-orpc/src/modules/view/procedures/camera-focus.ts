import { Effect } from "effect";

import { civ7ControlOrpcErrorCorrelationData } from "../../../model/correlation";
import { civ7ControlOrpcImplementer } from "../../../procedure";
import { viewCameraFromFocusResult } from "../camera-readback";

/**
 * Moves the in-game camera to a plot through the engine Camera API
 * (Camera.lookAtPlot + PlotCursor sync) and reports the VERIFIED outcome:
 * the atom reads back which plot actually sits at the viewport center
 * (Camera.pickPlot) and the result's `centerMatchesTarget` carries that
 * verdict.
 *
 * A move whose center readback misses the target is NOT an error here — the
 * caller gets the truth and decides (plots near the map edge can never
 * center exactly). Only a move that never happened (Camera.lookAtPlot
 * unavailable or the facade call failing) fails, as CAMERA_FOCUS_FAILED.
 *
 * The camera deliberately STAYS where it was moved — camera position is
 * navigation state the caller asked to change, not UI chrome to restore.
 */
export const viewCameraFocusProcedure =
  civ7ControlOrpcImplementer.view.camera.focus.effect(function* ({
    context,
    errors,
    input,
  }) {
    const errorData = {
      procedureKey: "view.camera.focus" as const,
      source: "direct-control-facade" as const,
      ...civ7ControlOrpcErrorCorrelationData(context),
    };
    const focus = yield* Effect.tryPromise({
      try: () =>
        context.directControl.focusCiv7Camera(
          {
            x: input.x,
            y: input.y,
            ...(input.zoom === undefined ? {} : { zoom: input.zoom }),
            ...(input.instantaneous === undefined
              ? {}
              : { instantaneous: input.instantaneous }),
          },
          context.endpointDefaults,
        ),
      catch: (error) =>
        errors.CAMERA_FOCUS_FAILED({
          data: {
            ...errorData,
            detail: error instanceof Error ? error.message : String(error),
          },
        }),
    });
    if (!focus.lookAt.ok || focus.lookAt.value !== true) {
      return yield* Effect.fail(
        errors.CAMERA_FOCUS_FAILED({
          data: {
            ...errorData,
            detail: focus.lookAt.ok
              ? "camera move readback reported the lookAt did not run"
              : focus.lookAt.error,
          },
        }),
      );
    }
    return viewCameraFromFocusResult(focus);
  });
