import { Data, type Effect } from "effect";
import { type Static, Type } from "typebox";

const WindowSelectionSchema = Type.Union([
  Type.ReadonlyObject(
    Type.Object(
      {
        _tag: Type.Literal("window-id"),
        windowId: Type.String({ minLength: 1 }),
      },
      { additionalProperties: false }
    )
  ),
  Type.ReadonlyObject(
    Type.Object(
      {
        _tag: Type.Literal("text-contains"),
        text: Type.String({ minLength: 1 }),
      },
      { additionalProperties: false }
    )
  ),
]);

const WindowCaptureDestinationSchema = Type.ReadonlyObject(
  Type.Object(
    {
      path: Type.String({ minLength: 1 }),
    },
    { additionalProperties: false }
  )
);

/** Runtime contract for one provider-neutral, window-scoped PNG request. */
export const WindowCaptureRequestSchema = Type.ReadonlyObject(
  Type.Object(
    {
      selection: WindowSelectionSchema,
      destination: Type.Optional(WindowCaptureDestinationSchema),
    },
    { additionalProperties: false }
  )
);

/** Selects one window by an exact operating-system identifier or visible text. */
export type WindowSelection = Static<typeof WindowSelectionSchema>;

/** A caller-owned PNG destination. Providers never apply managed retention here. */
export type WindowCaptureDestination = Static<typeof WindowCaptureDestinationSchema>;

/** Provider-neutral request for one window-scoped PNG capture. */
export type WindowCaptureRequest = Static<typeof WindowCaptureRequestSchema>;

/** Generic facts observed about the selected window. */
export type CapturedWindow = Readonly<{
  readonly windowId: string;
  readonly applicationName: string;
  readonly applicationId?: string;
  readonly title: string;
  readonly width: number;
  readonly height: number;
  readonly onScreen: boolean;
}>;

/** Proven facts about the committed PNG file. */
export type WindowCapturePngFile = Readonly<{
  readonly path: string;
  readonly byteSize: number;
  readonly sha256: string;
  readonly mediaType: "image/png";
  readonly dimensions: Readonly<{
    readonly width: number;
    readonly height: number;
  }>;
}>;

/** Raw provider-neutral result for one completed capture. */
export type WindowCaptureResult = Readonly<{
  readonly requestedAt: string;
  readonly window: CapturedWindow;
  readonly file: WindowCapturePngFile;
}>;

/** Stable failure reasons exposed by every managed window-capture provider. */
export type WindowCaptureFailureReason =
  | "invalid-configuration"
  | "invalid-request"
  | "unsupported-platform"
  | "provider-released"
  | "permission-required"
  | "window-not-found"
  | "toolchain-unavailable"
  | "capture-failed";

/** Capability operation during which a window-capture failure was observed. */
export type WindowCaptureFailureOperation = "acquire" | "capture";

/** Typed provider-neutral failure at the managed window-capture boundary. */
export class WindowCaptureFailure extends Data.TaggedError("WindowCaptureFailure")<{
  readonly operation: WindowCaptureFailureOperation;
  readonly reason: WindowCaptureFailureReason;
  readonly message: string;
  readonly details?: unknown;
  readonly cause?: unknown;
}> {}

/** Ready managed access to provider-neutral, window-scoped PNG capture. */
export interface WindowCapture {
  capture(request: WindowCaptureRequest): Effect.Effect<WindowCaptureResult, WindowCaptureFailure>;
}
