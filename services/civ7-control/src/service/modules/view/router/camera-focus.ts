import { Effect } from "effect";
import { civ7ControlOrpcErrorCorrelationData } from "#civ7-control-service/model/dto/correlation";
import { viewCameraFromFocusResult } from "../model/policy/camera-readback";
import { module } from "../module";
export const cameraFocus = module.camera.focus.effect(function* ({ context, errors, input }) {
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
          ...(input.instantaneous === undefined ? {} : { instantaneous: input.instantaneous }),
        },
        context.endpointDefaults
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
      })
    );
  }
  return viewCameraFromFocusResult(focus);
});
