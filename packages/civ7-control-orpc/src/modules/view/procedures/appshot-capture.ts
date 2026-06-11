import { CIV7_CLEAN_FRAME_VIEW_NAME } from "@civ7/direct-control";
import { Effect, Ref } from "effect";

import type {
  Civ7ControlOrpcCleanFrameEnterResult,
  Civ7ControlOrpcCloseDisplaysResult,
  Civ7ControlOrpcWindowShotCaptureResult,
} from "../../../dependencies/direct-control";
import { civ7ControlOrpcErrorCorrelationData } from "../../../model/correlation";
import { civ7ControlOrpcImplementer } from "../../../procedure";
import type { Civ7ViewAppshotCaptureResult } from "../contract";

const DEFAULT_APPSHOT_SETTLE_MS = 400;

/**
 * Captures a clean, window-scoped frame of the live Civ7 session — game
 * window only (never the display), HUD and world overlays hidden, popups
 * purged — by orchestrating the direct-control atoms as one Effect state
 * machine:
 *
 *   1. suspend the DisplayQueueManager so nothing can mount mid-capture —
 *      verified by readback,
 *   2. purge already-queued displays through the official close path,
 *   3. enter the hidden-rules clean-frame view (ViewManager rules engine:
 *      harness + every world overlay hidden, optionally 3D units) — verified
 *      by readback before any pixel is captured,
 *   4. settle briefly so the UI runtime finishes the hide, then capture the
 *      Civ7 window via ScreenCaptureKit (native pixel scale, works occluded),
 *   5. restore the previous view and resume the queue — readback lands in
 *      `cleanFrame.restored`.
 *
 * The restore is bound to an acquire/release boundary: a hidden HUD or a
 * suspended queue silently degrades the whole session, so both are ALWAYS
 * restored even when the capture fails (e.g. the one-time Screen Recording
 * permission is missing — surfaced as APPSHOT_PERMISSION_REQUIRED with the
 * exact System Settings path in `data.detail`).
 */
export const viewAppshotCaptureProcedure =
  civ7ControlOrpcImplementer.view.appshot.capture.effect(function* ({
    context,
    errors,
    input,
  }) {
    const errorData = {
      procedureKey: "view.appshot.capture" as const,
      source: "direct-control-facade" as const,
      ...civ7ControlOrpcErrorCorrelationData(context),
    };
    const failure = (error: unknown) => {
      const detail = error instanceof Error ? error.message : String(error);
      const code = (error as { code?: string } | null)?.code;
      const data = { ...errorData, detail };
      if (code === "window-shot-permission-required") {
        return errors.APPSHOT_PERMISSION_REQUIRED({ data });
      }
      if (code === "window-shot-window-not-found") {
        return errors.APPSHOT_WINDOW_NOT_FOUND({ data });
      }
      return errors.APPSHOT_CAPTURE_FAILED({ data });
    };
    const facadeCall = <T>(call: () => Promise<T>) =>
      Effect.tryPromise({ try: call, catch: failure });

    const settleMs = input.settleMs ?? DEFAULT_APPSHOT_SETTLE_MS;
    const restoredInline = yield* Ref.make(false);

    return yield* Effect.acquireUseRelease(
      // Acquire: suspend the display queue, verified by readback — anything
      // past this point runs under the release finalizer's restore guarantee.
      Effect.gen(function* () {
        const suspend = yield* facadeCall(() =>
          context.directControl.suspendCiv7DisplayQueue(
            context.endpointDefaults,
          )
        );
        if (!suspend.isSuspended) {
          return yield* Effect.fail(
            errors.APPSHOT_CLEAN_FRAME_UNVERIFIED({
              data: {
                ...errorData,
                detail: "display queue suspension readback failed",
              },
            }),
          );
        }
        return suspend;
      }),
      () =>
        Effect.gen(function* () {
          const purge = yield* facadeCall(() =>
            context.directControl.closeCiv7Displays(
              {},
              context.endpointDefaults,
            )
          );
          const enter = yield* facadeCall(() =>
            context.directControl.enterCiv7CleanFrame(
              { hideUnits: input.hideUnits === true },
              context.endpointDefaults,
            )
          );
          if (
            !enter.switched
            || enter.view !== CIV7_CLEAN_FRAME_VIEW_NAME
            || !enter.harnessHidden
          ) {
            return yield* Effect.fail(
              errors.APPSHOT_CLEAN_FRAME_UNVERIFIED({
                data: {
                  ...errorData,
                  detail: "clean-frame view readback failed: view="
                    + enter.view
                    + " harnessHidden="
                    + String(enter.harnessHidden),
                },
              }),
            );
          }
          yield* Effect.sleep(settleMs);
          const shot = yield* facadeCall(() =>
            context.directControl.captureCiv7WindowShot({
              ...(input.outputPath === undefined
                ? {}
                : { outputPath: input.outputPath }),
              ...(input.appName === undefined
                ? {}
                : { appName: input.appName }),
              ...(input.windowId === undefined
                ? {}
                : { windowId: input.windowId }),
            })
          );

          // Restore inline so the readback can land in the result; the
          // release finalizer below only fires on failures.
          const exit = yield* facadeCall(() =>
            context.directControl.exitCiv7CleanFrame(context.endpointDefaults)
          );
          const resume = yield* facadeCall(() =>
            context.directControl.resumeCiv7DisplayQueue(
              context.endpointDefaults,
            )
          );
          yield* Ref.set(restoredInline, true);

          return viewAppshotCaptureResult({
            shot,
            purge,
            enter,
            settleMs,
            restored: {
              view: exit.view,
              harnessHidden: exit.harnessHidden,
              queueResumed: !resume.isSuspended,
            },
          });
        }),
      // Release: never leave the HUD hidden or the queue suspended — even
      // when the capture, the restore readback, or the resume fails.
      () =>
        Ref.get(restoredInline).pipe(
          Effect.flatMap((restored) =>
            restored ? Effect.void : Effect.promise(async () => {
              await context.directControl
                .exitCiv7CleanFrame(context.endpointDefaults)
                .then(() => undefined, () => undefined);
              await context.directControl
                .resumeCiv7DisplayQueue(context.endpointDefaults)
                .then(() => undefined, () => undefined);
            })
          ),
        ),
    );
  });

function viewAppshotCaptureResult(input: Readonly<{
  shot: Civ7ControlOrpcWindowShotCaptureResult;
  purge: Civ7ControlOrpcCloseDisplaysResult;
  enter: Civ7ControlOrpcCleanFrameEnterResult;
  settleMs: number;
  restored: Civ7ViewAppshotCaptureResult["cleanFrame"]["restored"];
}>): Civ7ViewAppshotCaptureResult {
  return {
    captureMode: "window-scoped-screencapturekit",
    requestedAt: input.shot.requestedAt,
    settleMs: input.settleMs,
    frameSource: input.shot.frameSource,
    window: {
      windowId: input.shot.window.windowId,
      app: input.shot.window.app,
      title: input.shot.window.title,
      width: input.shot.window.width,
      height: input.shot.window.height,
      onScreen: input.shot.window.onScreen,
    },
    file: {
      path: input.shot.file.path,
      byteSize: input.shot.file.byteSize,
      sha256: input.shot.file.sha256,
      mediaType: input.shot.file.mediaType,
      ...(input.shot.file.dimensions === undefined
        ? {}
        : { dimensions: input.shot.file.dimensions }),
    },
    cleanFrame: {
      viewBefore: input.enter.viewBefore,
      viewDuringCapture: input.enter.view,
      harnessHidden: input.enter.harnessHidden,
      hideUnits: input.enter.hideUnits,
      suspendVerified: true,
      suppressedDisplays: input.purge.closed.map((row) => ({
        category: row.category,
        closed: row.closed,
      })),
      restored: input.restored,
    },
  };
}
