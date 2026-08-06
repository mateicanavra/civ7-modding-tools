import { dirname } from "node:path";

import { Effect } from "effect";
import { expect, test } from "vitest";

import { acquireMacosScreenCaptureKitWindowCapture } from "../../index.js";

const destination = process.env.WINDOW_CAPTURE_LIVE_DESTINATION;
const text = process.env.WINDOW_CAPTURE_LIVE_TEXT;
const rawWindowId = process.env.WINDOW_CAPTURE_LIVE_WINDOW_ID;
const parsedWindowId = rawWindowId === undefined ? undefined : Number(rawWindowId);
const hasWindowId =
  rawWindowId !== undefined &&
  parsedWindowId !== undefined &&
  Number.isInteger(parsedWindowId) &&
  parsedWindowId >= 0 &&
  parsedWindowId <= 4_294_967_295;
const hasText = text !== undefined && text.trim().length > 0;
const live =
  process.platform === "darwin" &&
  destination !== undefined &&
  ((hasWindowId && !hasText) || (!hasWindowId && hasText));

test.skipIf(!live)(
  "captures the explicitly selected live window to the explicit destination",
  async () => {
    if (destination === undefined) throw new Error("Missing explicit live destination.");
    const selection = hasWindowId
      ? ({ _tag: "window-id", windowId: rawWindowId ?? "" } as const)
      : ({ _tag: "text-contains", text: text ?? "" } as const);
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const capture = yield* acquireMacosScreenCaptureKitWindowCapture({
            managedDestination: {
              root: dirname(destination),
              filePrefix: "window-capture-live-",
              retentionMs: 0,
            },
          });
          return yield* capture.capture({
            selection,
            destination: { path: destination },
          });
        })
      )
    );

    expect(result.file.path).toBe(destination);
    expect(result.file.mediaType).toBe("image/png");
    expect(result.file.byteSize).toBeGreaterThan(0);
  }
);
