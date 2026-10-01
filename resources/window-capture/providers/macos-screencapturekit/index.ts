import type { WindowCapture, WindowCaptureFailure } from "@civ7/window-capture";
import type { Effect, Scope } from "effect";
import {
  acquireMacosScreenCaptureKitWindowCaptureWithDependencies,
  defaultWindowCaptureProviderDependencies,
} from "./capture.js";
import type { MacosScreenCaptureKitWindowCaptureOptions } from "./config.js";

export type { MacosScreenCaptureKitWindowCaptureOptions } from "./config.js";

/** Acquires one compiled, ready ScreenCaptureKit capability for the surrounding Effect scope. */
export function acquireMacosScreenCaptureKitWindowCapture(
  options: MacosScreenCaptureKitWindowCaptureOptions
): Effect.Effect<WindowCapture, WindowCaptureFailure, Scope.Scope> {
  return acquireMacosScreenCaptureKitWindowCaptureWithDependencies(
    options,
    defaultWindowCaptureProviderDependencies
  );
}
