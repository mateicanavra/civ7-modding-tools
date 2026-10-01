import type {
  WindowCapture,
  WindowCaptureFailure,
  WindowCaptureResult,
} from "@civ7/window-capture";
import { Effect } from "effect";

declare const capture: WindowCapture;

const byId = capture.capture({ selection: { _tag: "window-id", windowId: "42" } });
const byText = capture.capture({
  selection: { _tag: "text-contains", text: "document" },
  destination: { path: "/tmp/window.png" },
});
const checkedFailure = byId.pipe(Effect.mapError((failure): WindowCaptureFailure => failure));
const checkedResult = byText.pipe(Effect.map((result): WindowCaptureResult => result));

void byId;
void byText;
void checkedFailure;
void checkedResult;
